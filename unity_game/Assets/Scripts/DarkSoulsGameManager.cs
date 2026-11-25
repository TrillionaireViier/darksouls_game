using System;
using UnityEngine;

namespace DarkSouls
{
    public enum BossType
    {
        TaurusDemon,
        BellGargoyle,
        CapraDemon,
        GreatGreyWolfSif,
        LordGwyn
    }

    public class DarkSoulsGameManager : MonoBehaviour
    {
        public static DarkSoulsGameManager Instance { get; private set; }

        public DarkSoulsPlayer player;
        public Bonfire bonfire;
        public DarkSoulsHUD hud;
        public WorldChunkStreamer worldStreamer;
        public CovenantSystem covenantSystem;

        [Header("Boss Prefabs")]
        public GameObject taurusPrefab;
        public GameObject gargoylePrefab;
        public GameObject capraPrefab;
        public GameObject sifPrefab;
        public GameObject gwynPrefab;

        public Transform bossSpawnPoint;
        public Vector3 lastSafeBonfirePosition = new Vector3(0f, 0f, 5f);

        private GameObject currentBossInstance;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            // Unity 6 LTS High-Performance 60 FPS Lock
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;
        }

        private void Start()
        {
            if (player == null) player = FindFirstObjectByType<DarkSoulsPlayer>();
            if (bonfire == null) bonfire = FindFirstObjectByType<Bonfire>();
            if (hud == null) hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (worldStreamer == null) worldStreamer = FindFirstObjectByType<WorldChunkStreamer>();
            if (covenantSystem == null) covenantSystem = FindFirstObjectByType<CovenantSystem>();

            SpawnBoss(BossType.TaurusDemon);
        }

        public void SpawnBoss(BossType type)
        {
            if (currentBossInstance != null) Destroy(currentBossInstance);

            Vector3 spawnPos = bossSpawnPoint != null ? bossSpawnPoint.position : new Vector3(0f, 0f, 35f);
            Quaternion spawnRot = bossSpawnPoint != null ? bossSpawnPoint.rotation : Quaternion.Euler(0f, 180f, 0f);

            GameObject prefabToSpawn = taurusPrefab;
            switch (type)
            {
                case BossType.TaurusDemon: prefabToSpawn = taurusPrefab; break;
                case BossType.BellGargoyle: prefabToSpawn = gargoylePrefab; break;
                case BossType.CapraDemon: prefabToSpawn = capraPrefab; break;
                case BossType.GreatGreyWolfSif: prefabToSpawn = sifPrefab; break;
                case BossType.LordGwyn: prefabToSpawn = gwynPrefab; break;
            }

            if (prefabToSpawn != null)
            {
                currentBossInstance = Instantiate(prefabToSpawn, spawnPos, spawnRot);
            }
        }

        public void WarpPlayerToArena()
        {
            if (player != null)
            {
                // Do not overwrite lastSafeBonfirePosition when fast-traveling to a boss arena
                player.transform.position = new Vector3(0f, 1f, -15f);
            }
        }

        public void SetSafeCheckpoint(Vector3 pos, bool isBossArena = false)
        {
            if (isBossArena) return;
            bool inColosseum = Mathf.Abs(pos.x) <= 17100f && pos.z >= 186300f && pos.z <= 567000f;
            if (!inColosseum)
            {
                lastSafeBonfirePosition = pos;
            }
        }

        public void RespawnPlayerSafely()
        {
            if (player == null) return;
            Vector3 safePos = lastSafeBonfirePosition;
            if (Mathf.Abs(safePos.x) <= 17100f && safePos.z >= 186300f && safePos.z <= 567000f)
            {
                safePos = new Vector3(0f, 0f, 5f);
            }
            player.transform.position = safePos;
            player.RestAtBonfire(safePos);
        }
    }
}
