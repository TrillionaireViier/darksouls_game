using System;
using UnityEngine;

namespace DarkSouls
{
    public class BossGwyn : MonoBehaviour
    {
        public enum BossState
        {
            Sleep,
            Chase,
            SunlightSpear,
            FlamingCombo,
            GrabExplosion,
            Dead
        }

        public float maxHealth = 3400f;
        public float currentHealth = 3400f;
        public float damage = 330f;
        public int soulReward = 20000;
        public float moveSpeed = 4.0f;

        public BossState State { get; private set; } = BossState.Sleep;
        public bool IsPhase2 { get; private set; } = false;

        private DarkSoulsPlayer targetPlayer;
        private float cooldown = 0f;

        public event Action<float, float> OnHealthChanged;
        public event Action<string> OnBossAwakened;
        public event Action<int> OnBossDefeated;

        private void Start()
        {
            currentHealth = maxHealth;
            targetPlayer = FindObjectOfType<DarkSoulsPlayer>();
        }

        private void Update()
        {
            if (State == BossState.Dead || targetPlayer == null) return;

            if (cooldown > 0f) cooldown -= Time.deltaTime;

            float dist = Vector3.Distance(transform.position, targetPlayer.transform.position);

            if (State == BossState.Sleep)
            {
                if (dist < 24f)
                {
                    State = BossState.Chase;
                    OnBossAwakened?.Invoke("Gwyn, Lord of Cinder");
                }
                return;
            }

            if (!IsPhase2 && currentHealth <= (maxHealth * 0.5f))
            {
                IsPhase2 = true;
                damage *= 1.35f;
                moveSpeed *= 1.15f;
            }

            Vector3 lookDir = (targetPlayer.transform.position - transform.position).normalized;
            lookDir.y = 0f;
            if (lookDir != Vector3.zero)
            {
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(lookDir), Time.deltaTime * 6.5f);
            }

            if (dist <= 3.8f && cooldown <= 0f)
            {
                ExecuteAttack();
            }
            else if (dist > 3.5f)
            {
                transform.position += transform.forward * moveSpeed * Time.deltaTime;
            }
        }

        private void ExecuteAttack()
        {
            State = IsPhase2 ? BossState.FlamingCombo : BossState.SunlightSpear;
            cooldown = IsPhase2 ? 1.4f : 2.0f;

            if (targetPlayer != null)
            {
                targetPlayer.TakeDamage(damage);
            }

            Invoke(nameof(ResetToChase), 0.7f);
        }

        private void ResetToChase()
        {
            if (State != BossState.Dead) State = BossState.Chase;
        }

        public void TakeDamage(float amount)
        {
            if (State == BossState.Dead) return;

            currentHealth = Mathf.Max(0f, currentHealth - amount);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);

            if (currentHealth <= 0f)
            {
                State = BossState.Dead;
                targetPlayer?.AddSouls(soulReward);
                OnBossDefeated?.Invoke(soulReward);
            }
        }
    }
}
