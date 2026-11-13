using System;
using UnityEngine;

namespace DarkSouls
{
    public class BossTaurus : MonoBehaviour
    {
        public enum BossState
        {
            Sleep,
            Chase,
            Slam,
            Sweep,
            EnrageRoar,
            Dead
        }

        public float maxHealth = 2200f;
        public float currentHealth = 2200f;
        public float damage = 280f;
        public int soulReward = 5000;
        public float moveSpeed = 2.6f;
        public Light weaponFireLight;

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
            if (State == BossState.Dead) return;

            if (targetPlayer == null) return;

            float dist = Vector3.Distance(transform.position, targetPlayer.transform.position);

            if (State == BossState.Sleep)
            {
                if (targetPlayer.transform.position.z > 95f || dist < 25f)
                {
                    Awaken();
                }
                return;
            }

            if (cooldown > 0f) cooldown -= Time.deltaTime;

            Vector3 lookPos = new Vector3(targetPlayer.transform.position.x, transform.position.y, targetPlayer.transform.position.z);
            transform.LookAt(lookPos);

            if (State == BossState.Chase)
            {
                if (dist > 4.2f)
                {
                    float speed = moveSpeed * (IsPhase2 ? 1.3f : 1.0f);
                    Vector3 dir = (targetPlayer.transform.position - transform.position).normalized;
                    dir.y = 0f;
                    transform.position += dir * speed * Time.deltaTime;
                }
                else if (cooldown <= 0f)
                {
                    ChooseAttack();
                }
            }
        }

        private void Awaken()
        {
            State = BossState.Chase;
            OnBossAwakened?.Invoke("TAURUS DEMON");
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
        }

        private void ChooseAttack()
        {
            cooldown = IsPhase2 ? 2.2f : 2.8f;
            if (UnityEngine.Random.value > 0.5f)
            {
                PerformSlam();
            }
            else
            {
                PerformSweep();
            }
        }

        private void PerformSlam()
        {
            State = BossState.Slam;
            Invoke(nameof(ExecuteSlamHit), 0.75f);
        }

        private void ExecuteSlamHit()
        {
            if (State != BossState.Dead && targetPlayer != null)
            {
                if (Vector3.Distance(transform.position, targetPlayer.transform.position) <= 5.0f)
                {
                    targetPlayer.TakeDamage(damage, transform.position);
                }
            }
            State = BossState.Chase;
        }

        private void PerformSweep()
        {
            State = BossState.Sweep;
            Invoke(nameof(ExecuteSweepHit), 0.6f);
        }

        private void ExecuteSweepHit()
        {
            if (State != BossState.Dead && targetPlayer != null)
            {
                if (Vector3.Distance(transform.position, targetPlayer.transform.position) <= 4.2f)
                {
                    targetPlayer.TakeDamage(damage * 0.8f, transform.position);
                }
            }
            State = BossState.Chase;
        }

        public void TakeDamage(float amount, Vector3 attackerPos)
        {
            if (State == BossState.Dead) return;

            if (State == BossState.Sleep) Awaken();

            currentHealth = Mathf.Max(0f, currentHealth - amount);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);

            if (currentHealth <= maxHealth * 0.5f && !IsPhase2)
            {
                TriggerPhase2();
            }

            if (currentHealth <= 0f)
            {
                Die();
            }
        }

        private void TriggerPhase2()
        {
            IsPhase2 = true;
            if (weaponFireLight != null) weaponFireLight.enabled = true;
        }

        private void Die()
        {
            State = BossState.Dead;
            if (targetPlayer != null) targetPlayer.AddSouls(soulReward);
            OnBossDefeated?.Invoke(soulReward);
            Destroy(gameObject, 2.5f);
        }
    }
}
