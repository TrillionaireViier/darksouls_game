using System;
using System.Collections.Generic;
using UnityEngine;

namespace DarkSouls
{
    [Serializable]
    public struct WorldLocation
    {
        public string id;
        public string name;
        public string zone;
        public Vector3 position;
        public string bossName;
        public string dangerTier;
    }

    /// <summary>
    /// Unity 6.3 LTS High-FPS Spatial Chunk Streamer & 5x Location Registry (Build V72).
    /// Streams 2500m x 2500m world chunks (3x3 active window) and indexes 226,085+ locations in O(1).
    /// </summary>
    public class WorldChunkStreamer : MonoBehaviour
    {
        [Header("5x World Dimensions")]
        public float worldHalfExtentX = 360000f;
        public float worldHalfExtentZ = 375000f;
        public float chunkSize = 2500f;
        public float locationGridCellSize = 5000f;

        [Header("60 FPS PointLight Pool")]
        public int maxActivePointLights = 6;

        public Transform playerTransform;
        public int TotalLocationsCount => allLocations.Count;

        private readonly List<WorldLocation> allLocations = new List<WorldLocation>(226100);
        private readonly Dictionary<long, List<WorldLocation>> locationGrid = new Dictionary<long, List<WorldLocation>>();
        private readonly Dictionary<long, GameObject> activeChunks = new Dictionary<long, GameObject>();
        private readonly List<Light> pooledLights = new List<Light>();

        private long lastPlayerChunkKey = long.MinValue;
        private float updateTimer = 0f;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;
            InitLightPool();
            BuildLocations5x();
        }

        private void Start()
        {
            if (playerTransform == null)
            {
                var p = FindFirstObjectByType<DarkSoulsPlayer>();
                if (p != null) playerTransform = p.transform;
            }
        }

        private void Update()
        {
            if (playerTransform == null) return;
            updateTimer += Time.deltaTime;
            if (updateTimer >= 0.08f)
            {
                updateTimer = 0f;
                UpdateChunksAround(playerTransform.position);
            }
        }

        private void InitLightPool()
        {
            for (int i = 0; i < maxActivePointLights; i++)
            {
                var go = new GameObject($"PooledTorchLight_{i}");
                go.transform.SetParent(transform, false);
                var light = go.AddComponent<Light>();
                light.type = LightType.Point;
                light.range = 25f;
                light.intensity = 2.4f;
                light.shadows = LightShadows.None;
                go.SetActive(false);
                pooledLights.Add(light);
            }
        }

        private static long PackCoord(int cx, int cz) => ((long)cx << 32) ^ (uint)cz;

        private void BuildLocations5x()
        {
            string[] zones = {
                "Firelink Citadel", "Anor Londo", "Darkroot Woods", "Ash Lake", "Blighttown",
                "Sunken Serpent Abyss", "Altus Plateau", "Carian Observatory", "Leyndell Capital",
                "Cainhurst Parapets", "Ashina Castle", "Fountainhead Palace"
            };
            string[] bosses = {
                "Taurus Demon", "Bell Gargoyle", "Capra Demon", "Great Grey Wolf Sif",
                "Gwyn, Lord of Cinder", "Knight Artorias", "Nameless King", "Slave Knight Gael"
            };
            string[] sectorTags = {
                "Core Realm", "Outer Abyssal Rim", "Astral Titan Expanse",
                "Primordial Horizon", "Eternal Eclipse Reach"
            };

            const int baseSectors = 45217;
            for (int s = 0; s < 5; s++)
            {
                float mult = 1f + s * 1.15f;
                float sx = (s % 2 == 0) ? 1f : -1f;
                float sz = (s < 3) ? 1f : -1f;

                for (int i = 0; i < baseSectors; i++)
                {
                    float angle = (i % 360) * Mathf.Deg2Rad;
                    float dist = 350f + (i % 64) * 520f * mult;
                    float wx = Mathf.Cos(angle) * dist * sx;
                    float wz = Mathf.Sin(angle) * dist * sz;
                    float wy = (i % 5 == 0) ? -6f : ((i % 7 == 0) ? 14f : 0f);

                    var loc = new WorldLocation
                    {
                        id = $"loc_5x_s{s}_{i}",
                        name = $"{zones[i % zones.Length]} Sector #{i + 1} [{sectorTags[s]}]",
                        zone = zones[i % zones.Length],
                        position = new Vector3(wx, wy, wz),
                        bossName = bosses[i % bosses.Length],
                        dangerTier = $"Tier {(i % 8) + 1}"
                    };

                    allLocations.Add(loc);

                    int gx = Mathf.FloorToInt(wx / locationGridCellSize);
                    int gz = Mathf.FloorToInt(wz / locationGridCellSize);
                    long key = PackCoord(gx, gz);
                    if (!locationGrid.TryGetValue(key, out var bucket))
                    {
                        bucket = new List<WorldLocation>(8);
                        locationGrid[key] = bucket;
                    }
                    bucket.Add(loc);
                }
            }
        }

        public float GetGroundHeight(float x, float z, float currentY)
        {
            // Surface Boss Arena (5x Colossal Expansion)
            if (x >= -17100f && x <= 17100f && z >= 186300f && z <= 567000f && currentY >= -2.2f)
                return 0f;

            // Central Royal Bridge (5x Colossal Expansion)
            if (x >= -4275f && x <= 4275f && z >= 24075f && z <= 186750f && currentY >= -2.2f)
                return 0f;

            // Courtyard Starting Arena (5x Colossal Expansion)
            if (x >= -20250f && x <= 20250f && z >= -101250f && z <= 24300f)
                return (x >= -25.5f && x <= -14.5f && z >= 22f && z <= 270f && currentY < -2f) ? -4.92f : 0f;

            // O(1) Spatial Location Height Query
            int gx = Mathf.FloorToInt(x / locationGridCellSize);
            int gz = Mathf.FloorToInt(z / locationGridCellSize);
            float minDistSq = 1200f * 1200f;
            float bestY = 0f;
            bool found = false;

            for (int dx = -1; dx <= 1; dx++)
            {
                for (int dz = -1; dz <= 1; dz++)
                {
                    if (!locationGrid.TryGetValue(PackCoord(gx + dx, gz + dz), out var bucket)) continue;
                    for (int i = 0; i < bucket.Count; i++)
                    {
                        var loc = bucket[i];
                        float lx = x - loc.position.x;
                        float lz = z - loc.position.z;
                        float d2 = lx * lx + lz * lz;
                        if (d2 < minDistSq && Mathf.Abs(currentY - loc.position.y) < 22f)
                        {
                            minDistSq = d2;
                            bestY = loc.position.y;
                            found = true;
                        }
                    }
                }
            }

            if (found) return bestY;
            if (x >= -720000f && x <= 720000f && z >= -375000f && z <= 375000f) return 0f;
            return -50f;
        }

        private void UpdateChunksAround(Vector3 playerPos)
        {
            int pcx = Mathf.FloorToInt(playerPos.x / chunkSize);
            int pcz = Mathf.FloorToInt(playerPos.z / chunkSize);
            long key = PackCoord(pcx, pcz);
            if (key == lastPlayerChunkKey) return;
            lastPlayerChunkKey = key;

            var keepKeys = new HashSet<long>();
            for (int dx = -1; dx <= 1; dx++)
            {
                for (int dz = -1; dz <= 1; dz++)
                {
                    long ck = PackCoord(pcx + dx, pcz + dz);
                    keepKeys.Add(ck);
                    if (!activeChunks.TryGetValue(ck, out var chunkGo))
                    {
                        chunkGo = new GameObject($"WorldChunk_{pcx + dx}_{pcz + dz}");
                        chunkGo.transform.SetParent(transform, false);
                        activeChunks[ck] = chunkGo;
                    }
                    chunkGo.SetActive(true);
                }
            }

            foreach (var kvp in activeChunks)
            {
                if (!keepKeys.Contains(kvp.Key))
                {
                    kvp.Value.SetActive(false);
                }
            }
        }
    }
}
