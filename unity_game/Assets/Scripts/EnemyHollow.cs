using System;
using UnityEngine;

namespace DarkSouls
{
    public class EnemyHollow : MonoBehaviour
    {
        public enum AIState
        {
            Patrol,
            Chase,
            Attack,
            Stagger,
            Dead
        }

        public float maxHealth = 320f;
        public float currentHealth = 320f;
        public float damage = 115f;
        public int soulReward = 150;
        public float moveSpeed = 2.4f;
        public float aggroRadius = 14f;
        public float attackRadius = 2.0f;

        public AIState State { get; private set; } = AIState.Patrol;

        private DarkSoulsPlayer targetPlayer;
        private Vector3 spawnPosition;
        private float cooldown = 0f;
        private float stateTimer = 0f;

        public event Action<int> OnDefeated;

        private void Start()
        {
            spawnPosition = transform.position;
            currentHealth = maxHealth;
            targetPlayer = FindObjectOfType<DarkSoulsPlayer>();
        }

        private void Update()
        {
            if (State == AIState.Dead) return;

            if (cooldown > 0f) cooldown -= Time.deltaTime;

            if (State == AIState.Stagger)
            {
                stateTimer -= Time.deltaTime;
                if (stateTimer <= 0f) State = AIState.Chase;
                return;
            }

            if (targetPlayer == null) return;

            float dist = Vector3.Distance(transform.position, targetPlayer.transform.position);

            if (dist <= aggroRadius)
            {
                Vector3 lookPos = new Vector3(targetPlayer.transform.position.x, transform.position.y, targetPlayer.transform.position.z);
                transform.LookAt(lookPos);

                if (dist > attackRadius)
                {
                    Vector3 dir = (targetPlayer.transform.position - transform.position).normalized;
                    dir.y = 0f;
                    transform.position += dir * moveSpeed * Time.deltaTime;
                    State = AIState.Chase;
                }
                else
                {
                    if (cooldown <= 0f)
                    {
                        PerformAttack();
                    }
                }
            }
            else
            {
                State = AIState.Patrol;
            }
        }

        private void PerformAttack()
        {
            State = AIState.Attack;
            cooldown = 1.8f;
            Invoke(nameof(ExecuteAttackHit), 0.3f);
        }

        private void ExecuteAttackHit()
        {
            if (State != AIState.Dead && State != AIState.Stagger && targetPlayer != null)
            {
                if (Vector3.Distance(transform.position, targetPlayer.transform.position) <= attackRadius + 0.6f)
                {
                    targetPlayer.TakeDamage(damage, transform.position);
                }
            }
            State = AIState.Chase;
        }

        public void TakeDamage(float amount, Vector3 attackerPos)
        {
            if (State == AIState.Dead) return;

            currentHealth = Mathf.Max(0f, currentHealth - amount);

            if (currentHealth <= 0f)
            {
                Die();
            }
            else
            {
                State = AIState.Stagger;
                stateTimer = 0.45f;
            }
        }

        private void Die()
        {
            State = AIState.Dead;
            if (targetPlayer != null) targetPlayer.AddSouls(soulReward);
            OnDefeated?.Invoke(soulReward);
            Destroy(gameObject, 1.2f);
        }

        public void ResetEnemy()
        {
            transform.position = spawnPosition;
            currentHealth = maxHealth;
            State = AIState.Patrol;
        }
    }
}
