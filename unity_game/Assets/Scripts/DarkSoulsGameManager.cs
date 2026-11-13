using UnityEngine;

namespace DarkSouls
{
    public class DarkSoulsGameManager : MonoBehaviour
    {
        public DarkSoulsPlayer player;
        public DarkSoulsHUD hud;
        public Bonfire bonfire;
        public BossTaurus boss;
        public Transform enemiesParent;

        private void Start()
        {
            if (player != null && hud != null)
            {
                player.OnHealthChanged += hud.UpdateHealth;
                player.OnStaminaChanged += hud.UpdateStamina;
                player.OnEstusChanged += hud.UpdateEstus;
                player.OnSoulsChanged += hud.UpdateSouls;
                player.OnNotification += hud.ShowNotification;
                player.OnPlayerDied += hud.ShowDeathScreen;
            }

            if (bonfire != null)
            {
                bonfire.OnBonfireRested += HandleBonfireRested;
            }

            if (boss != null && hud != null)
            {
                boss.OnBossAwakened += hud.ShowBoss;
                boss.OnHealthChanged += hud.UpdateBossHealth;
                boss.OnBossDefeated += (souls) => hud.ShowVictory();
            }

            hud.ShowNotification("WELCOME TO LORDRAN. PREPARE TO DIE.");
        }

        private void Update()
        {
            if (player != null && player.State == PlayerState.Dead)
            {
                if (Input.GetKeyDown(KeyCode.Space))
                {
                    RespawnAtBonfire();
                }
            }
        }

        private void HandleBonfireRested()
        {
            if (hud != null) hud.ShowBonfireLit();

            // Reset all hollow enemies
            if (enemiesParent != null)
            {
                foreach (Transform child in enemiesParent)
                {
                    if (child.TryGetComponent<EnemyHollow>(out var enemy))
                    {
                        enemy.ResetEnemy();
                    }
                }
            }
        }

        public void RespawnAtBonfire()
        {
            if (bonfire != null && player != null)
            {
                player.transform.position = bonfire.transform.position + Vector3.forward * 3f;
                player.RestAtBonfire(bonfire.transform.position);
                if (hud != null && hud.deathScreen != null)
                {
                    hud.deathScreen.SetActive(false);
                }
                HandleBonfireRested();
            }
        }
    }
}
