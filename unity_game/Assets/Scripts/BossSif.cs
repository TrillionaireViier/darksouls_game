using System;
using UnityEngine;

namespace DarkSouls
{
    public class BossSif : MonoBehaviour
    {
        public enum BossState
        {
            Sleep,
            Chase,
            SpinSlash360,
            LeapingSlash,
            Dead
        }

        public float maxHealth = 2800f;
        public float currentHealth = 2800f;
        public float damage = 270f;
        public int soulReward = 12000;
        public float moveSpeed = 4.2f;

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
                if (dist < 22f)
                {
                    State = BossState.Chase;
                    OnBossAwakened?.Invoke("Great Grey Wolf Sif");
                }
                return;
            }

            if (!IsPhase2 && currentHealth <= (maxHealth * 0.4f))
            {
                IsPhase2 = true;
                damage *= 1.3f;
                moveSpeed *= 1.1f;
            }

            Vector3 lookDir = (targetPlayer.transform.position - transform.position).normalized;
            lookDir.y = 0f;
            if (lookDir != Vector3.zero)
            {
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(lookDir), Time.deltaTime * 6f);
            }

            if (dist <= 4.5f && cooldown <= 0f)
            {
                ExecuteAttack();
            }
            else if (dist > 4.0f)
            {
                transform.position += transform.forward * moveSpeed * Time.deltaTime;
            }
        }

        private void ExecuteAttack()
        {
            State = IsPhase2 ? BossState.SpinSlash360 : BossState.LeapingSlash;
            cooldown = IsPhase2 ? 1.6f : 2.4f;

            if (targetPlayer != null)
            {
                targetPlayer.TakeDamage(damage);
            }

            Invoke(nameof(ResetToChase), 0.75f);
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
