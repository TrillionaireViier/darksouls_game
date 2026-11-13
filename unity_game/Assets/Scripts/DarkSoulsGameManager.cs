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

        [Header("Boss Prefabs")]
        public GameObject taurusPrefab;
        public GameObject gargoylePrefab;
        public GameObject capraPrefab;
        public GameObject sifPrefab;
        public GameObject gwynPrefab;

        public Transform bossSpawnPoint;

        private GameObject currentBossInstance;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            if (player == null) player = FindObjectOfType<DarkSoulsPlayer>();
            if (bonfire == null) bonfire = FindObjectOfType<Bonfire>();
            if (hud == null) hud = FindObjectOfType<DarkSoulsHUD>();

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
                player.transform.position = new Vector3(0f, 1f, -15f);
            }
        }
    }
}
