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
        public bool isOutsideRealm;
    }

    /// <summary>
    /// Unity 6 LTS High-FPS Spatial Chunk Streamer & 5x5 (25x Total) Location Registry (Build V75).
    /// Streams 2500m x 2500m 3D world chunks (3x3 active window) with procedural gothic architecture,
    /// pooled torch lights, and 1,130,425+ O(1) indexed locations across 40+ Dark Souls & Outside realms.
    /// </summary>
    public class WorldChunkStreamer : MonoBehaviour
    {
        [Header("25x Colossal World Dimensions")]
        public float worldHalfExtentX = 1800000f;
        public float worldHalfExtentZ = 1875000f;
        public float chunkSize = 2500f;
        public float locationGridCellSize = 5000f;

        [Header("60 FPS PointLight Pool")]
        public int maxActivePointLights = 6;

        public Transform playerTransform;
        public int TotalLocationsCount => allLocations.Count;
        public WorldLocation CurrentNearestLocation { get; private set; }

        private readonly List<WorldLocation> allLocations = new List<WorldLocation>(1130500);
        private readonly Dictionary<long, List<WorldLocation>> locationGrid = new Dictionary<long, List<WorldLocation>>();
        private readonly Dictionary<long, GameObject> activeChunks = new Dictionary<long, GameObject>();
        private readonly List<Light> pooledLights = new List<Light>();
        private readonly List<Vector3> activeTorchPositions = new List<Vector3>();

        private long lastPlayerChunkKey = long.MinValue;
        private float updateTimer = 0f;
        private Material stoneFloorMat;
        private Material pillarMat;
        private Material goldTrimMat;

        private static readonly string[] AllZones = {
            // Core & 5x Zones
            "Firelink Citadel", "Anor Londo", "Darkroot Woods", "Ash Lake", "Blighttown",
            "Sunken Serpent Abyss", "Altus Plateau", "Carian Observatory", "Leyndell Capital",
            "Cainhurst Parapets", "Ashina Castle", "Fountainhead Palace",
            // V74 Outside Locations
            "Kiln of the First Flame", "Chasm of the Abyss", "Crystal Cave Archive", "Untended Graves",
            "Undead Crypt Colonnade", "Astral Clocktower", "Oolacile Calamity Crater", "Deeproot Depths",
            "Lothric Castle Throne", "Painted World of Ariamis", "Ashina Upper Dojo", "Caelid Wailing Dunes",
            "Oedon Tomb Graveyard", "Lost Bastille Rampart", "Stormveil Grafted Courtyard", "Moonlight Altar of Manus Celes",
            "Cathedral of the Deep", "Shaded Castle Moat", "Mt. Senpou Sanctum", "Nokstella Eternal City",
            "Leyndell Erdtree Sanctuary", "Usui Misty Forest", "Ainsel River Basin", "Upper Cathedral Ward",
            "Jagged Peak Dragon's Pit", "Volcano Manor Magma Lake", "Farron Keep Mausoleum", "Crumbling Farum Azula",
            "Irithyll Boreal Cathedral", "Hirata Estate Blazing Hall", "Raya Lucaria Grand Library", "Ancient Ruins of Rauh"
        };

        private static readonly string[] AllBosses = {
            "Taurus Demon", "Bell Gargoyle", "Capra Demon", "Great Grey Wolf Sif",
            "Gwyn, Lord of Cinder", "Manus, Father of the Abyss", "Seath the Scaleless",
            "Champion Gundyr", "Velstadt, Royal Aegis", "Lady Maria", "Black Dragon Kalameet",
            "Lichdragon Fortissax", "Twin Princes Lothric & Lorian", "Crossbreed Priscilla",
            "Isshin, Sword Saint", "Starscourge Radahn", "Father Gascoigne",
            "Ornstein & Smough", "The Pursuer", "Godrick the Grafted", "Pontiff Sulyvahn",
            "Maliketh, the Black Blade", "Morgott, the Omen King", "Rennala, Queen of the Full Moon",
            "Demon of Hatred"
        };

        private static readonly string[] SectorTags = {
            "Core Realm", "Outer Abyssal Rim", "Astral Titan Expanse",
            "Primordial Horizon", "Eternal Eclipse Reach",
            "Outside Shattered Veil", "Outside Ash Caldera", "Outside Lunar Spire",
            "Outside Crimson Rot", "Outside Celestial Void"
        };

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;
            InitSharedMaterials();
            InitLightPool();
            BuildLocations5xUnity();
        }

        private void Start()
        {
            if (playerTransform == null)
            {
                var p = FindFirstObjectByType<DarkSoulsPlayer>();
                if (p != null) playerTransform = p.transform;
            }
            if (playerTransform != null)
            {
                UpdateChunksAround(playerTransform.position);
                UpdateNearestLocation(playerTransform.position);
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
                UpdateLightPool(playerTransform.position);
                UpdateNearestLocation(playerTransform.position);
            }
        }

        private void InitSharedMaterials()
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            stoneFloorMat = new Material(shader) { color = new Color(0.24f, 0.23f, 0.25f) };
            pillarMat = new Material(shader) { color = new Color(0.18f, 0.17f, 0.20f) };
            goldTrimMat = new Material(shader) { color = new Color(0.55f, 0.44f, 0.22f) };
        }

        private void InitLightPool()
        {
            for (int i = 0; i < maxActivePointLights; i++)
            {
                var go = new GameObject($"PooledTorchLight_{i}");
                go.transform.SetParent(transform, false);
                var light = go.AddComponent<Light>();
                light.type = LightType.Point;
                light.color = new Color(1.0f, 0.58f, 0.22f);
                light.range = 28f;
                light.intensity = 2.6f;
                light.shadows = LightShadows.None;
                go.SetActive(false);
                pooledLights.Add(light);
            }
        }

        private static long PackCoord(int cx, int cz) => ((long)cx << 32) ^ (uint)cz;

        /// <summary>
        /// Generates 1,130,425+ locations (5x previous 226,085) across 25 sectors and 44 zones.
        /// </summary>
        private void BuildLocations5xUnity()
        {
            const int baseSectors = 45217;
            const int sectorCount = 25; // 5x more than previous 5 sectors!
            for (int s = 0; s < sectorCount; s++)
            {
                float mult = 1f + (s % 10) * 1.35f + (s / 10) * 4.5f;
                float sx = (s % 2 == 0) ? 1f : -1f;
                float sz = (s % 4 < 2) ? 1f : -1f;
                bool isOutside = s >= 5;

                for (int i = 0; i < baseSectors; i++)
                {
                    float angle = ((i + s * 17) % 360) * Mathf.Deg2Rad;
                    float dist = 350f + (i % 64) * 560f * mult;
                    float wx = Mathf.Cos(angle) * dist * sx;
                    float wz = Mathf.Sin(angle) * dist * sz;
                    float wy = (i % 5 == 0) ? -6f : ((i % 7 == 0) ? 14f : 0f);

                    string zoneName = AllZones[(i + s * 3) % AllZones.Length];
                    string tag = SectorTags[s % SectorTags.Length];

                    var loc = new WorldLocation
                    {
                        id = $"loc_u5x_s{s}_{i}",
                        name = $"{zoneName} Sector #{i + 1} [{tag}]",
                        zone = zoneName,
                        position = new Vector3(wx, wy, wz),
                        bossName = AllBosses[(i + s) % AllBosses.Length],
                        dangerTier = $"Tier {((i + s) % 10) + 1}",
                        isOutsideRealm = isOutside
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

        public WorldLocation GetSampleLocation(int index)
        {
            if (allLocations.Count == 0) return default;
            int idx = Mathf.Abs(index) % allLocations.Count;
            return allLocations[idx];
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
            if (x >= -worldHalfExtentX && x <= worldHalfExtentX && z >= -worldHalfExtentZ && z <= worldHalfExtentZ) return 0f;
            return -50f;
        }

        private void UpdateNearestLocation(Vector3 pos)
        {
            int gx = Mathf.FloorToInt(pos.x / locationGridCellSize);
            int gz = Mathf.FloorToInt(pos.z / locationGridCellSize);
            float bestDistSq = float.MaxValue;
            WorldLocation bestLoc = new WorldLocation
            {
                id = "firelink_sanctuary",
                name = "Firelink Citadel Courtyard",
                zone = "Firelink Citadel",
                position = Vector3.zero,
                bossName = "Taurus Demon",
                dangerTier = "Tier 1"
            };

            for (int dx = -1; dx <= 1; dx++)
            {
                for (int dz = -1; dz <= 1; dz++)
                {
                    if (!locationGrid.TryGetValue(PackCoord(gx + dx, gz + dz), out var bucket)) continue;
                    for (int i = 0; i < bucket.Count; i++)
                    {
                        var loc = bucket[i];
                        float d2 = (pos - loc.position).sqrMagnitude;
                        if (d2 < bestDistSq)
                        {
                            bestDistSq = d2;
                            bestLoc = loc;
                        }
                    }
                }
            }

            CurrentNearestLocation = bestLoc;
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
                    int cx = pcx + dx;
                    int cz = pcz + dz;
                    long ck = PackCoord(cx, cz);
                    keepKeys.Add(ck);
                    if (!activeChunks.TryGetValue(ck, out var chunkGo))
                    {
                        chunkGo = BuildChunkGeometry(cx, cz);
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

        private GameObject BuildChunkGeometry(int cx, int cz)
        {
            var chunkGo = new GameObject($"WorldChunk_{cx}_{cz}");
            chunkGo.transform.SetParent(transform, false);

            float centerX = (cx + 0.5f) * chunkSize;
            float centerZ = (cz + 0.5f) * chunkSize;

            // Ground slab (no flickering: clean single collider + lit stone)
            var ground = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ground.name = "GroundSlab";
            ground.transform.SetParent(chunkGo.transform, false);
            ground.transform.position = new Vector3(centerX, -0.5f, centerZ);
            ground.transform.localScale = new Vector3(chunkSize, 1f, chunkSize);
            var gRenderer = ground.GetComponent<Renderer>();
            if (gRenderer != null) gRenderer.sharedMaterial = stoneFloorMat;

            // Procedural gothic pillars & wall-mounted torches (6 pillars around chunk center)
            int seed = (cx * 73856093) ^ (cz * 19349663);
            System.Random rng = new System.Random(seed);
            for (int i = 0; i < 12; i++)
            {
                float ox = (float)(rng.NextDouble() - 0.5) * (chunkSize * 0.7f);
                float oz = (float)(rng.NextDouble() - 0.5) * (chunkSize * 0.7f);
                float px = centerX + ox;
                float pz = centerZ + oz;

                // Keep central spawn clear
                if (Mathf.Abs(px) < 12f && Mathf.Abs(pz) < 12f) continue;

                float height = 10f + (float)rng.NextDouble() * 14f;
                var pillar = GameObject.CreatePrimitive(PrimitiveType.Cube);
                pillar.name = $"GothicPillar_{i}";
                pillar.transform.SetParent(chunkGo.transform, false);
                pillar.transform.position = new Vector3(px, height * 0.5f, pz);
                pillar.transform.localScale = new Vector3(2.8f, height, 2.8f);
                var pr = pillar.GetComponent<Renderer>();
                if (pr != null) pr.sharedMaterial = (i % 3 == 0) ? goldTrimMat : pillarMat;

                // Attach torch directly to pillar (never floating in mid-air!)
                if (i % 2 == 0)
                {
                    var torch = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                    torch.name = $"PillarTorch_{i}";
                    torch.transform.SetParent(pillar.transform, false);
                    torch.transform.localPosition = new Vector3(0f, 0.1f, 0.65f);
                    torch.transform.localScale = new Vector3(0.18f, 0.12f, 0.18f);
                    Destroy(torch.GetComponent<Collider>());
                    activeTorchPositions.Add(new Vector3(px, height * 0.5f + 1.2f, pz + 1.8f));
                }
            }

            return chunkGo;
        }

        private void UpdateLightPool(Vector3 playerPos)
        {
            if (activeTorchPositions.Count == 0 || pooledLights.Count == 0) return;

            // Assign pooled lights to nearest torches for 60 FPS stability
            for (int l = 0; l < pooledLights.Count; l++)
            {
                float bestDist = 4500f;
                int bestIdx = -1;
                for (int t = 0; t < activeTorchPositions.Count; t++)
                {
                    float d = (activeTorchPositions[t] - playerPos).sqrMagnitude;
                    if (d < bestDist)
                    {
                        bool alreadyUsed = false;
                        for (int prev = 0; prev < l; prev++)
                        {
                            if (pooledLights[prev].gameObject.activeSelf &&
                                (pooledLights[prev].transform.position - activeTorchPositions[t]).sqrMagnitude < 1f)
                            {
                                alreadyUsed = true;
                                break;
                            }
                        }
                        if (!alreadyUsed)
                        {
                            bestDist = d;
                            bestIdx = t;
                        }
                    }
                }

                if (bestIdx >= 0)
                {
                    pooledLights[l].transform.position = activeTorchPositions[bestIdx];
                    pooledLights[l].gameObject.SetActive(true);
                }
                else
                {
                    pooledLights[l].gameObject.SetActive(false);
                }
            }
        }
    }
}
