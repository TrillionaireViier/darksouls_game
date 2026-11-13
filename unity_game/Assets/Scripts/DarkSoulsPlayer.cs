using System;
using System.Collections;
using UnityEngine;

namespace DarkSouls
{
    public enum PlayerState
    {
        Idle,
        Locomotion,
        Roll,
        Attack,
        Block,
        Parry,
        DrinkEstus,
        Stagger,
        Dead
    }

    [RequireComponent(typeof(CharacterController))]
    public class DarkSoulsPlayer : MonoBehaviour
    {
        [Header("Attributes")]
        public float maxHealth = 1000f;
        public float currentHealth = 1000f;
        public float maxStamina = 100f;
        public float currentStamina = 100f;
        public float staminaRegenRate = 38f;
        public int estusFlasks = 5;
        public int maxEstusFlasks = 5;
        public int souls = 0;

        [Header("Movement")]
        public float walkSpeed = 5.0f;
        public float sprintSpeed = 7.5f;
        public float rollSpeed = 9.0f;
        public float gravity = 20.0f;
        public float mouseSensitivity = 2.5f;

        [Header("Combat References")]
        public Transform cameraPivot;
        public Transform weaponTip;
        public LayerMask enemyLayers;
        public GameObject shieldMesh;
        public GameObject estusParticlePrefab;

        public PlayerState State { get; private set; } = PlayerState.Idle;
        public bool IsInvincible { get; private set; } = false;

        private CharacterController controller;
        private Vector3 moveDirection = Vector3.zero;
        private Vector3 rollDirection = Vector3.forward;
        private float verticalVelocity = 0f;
        private float staminaDelay = 0f;
        private float stateTimer = 0f;
        private float cameraPitch = 0f;
        private int attackCombo = 0;

        // Events
        public event Action<float, float> OnHealthChanged;
        public event Action<float, float> OnStaminaChanged;
        public event Action<int, int> OnEstusChanged;
        public event Action<int> OnSoulsChanged;
        public event Action OnPlayerDied;
        public event Action<string> OnNotification;

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
        }

        private void Start()
        {
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
            currentHealth = maxHealth;
            currentStamina = maxStamina;

            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);
            OnEstusChanged?.Invoke(estusFlasks, maxEstusFlasks);
            OnSoulsChanged?.Invoke(souls);
        }

        private void Update()
        {
            if (State == PlayerState.Dead) return;

            HandleMouseOrbit();
            HandleStamina(Time.deltaTime);

            switch (State)
            {
                case PlayerState.Idle:
                case PlayerState.Locomotion:
                    HandleMovement(Time.deltaTime);
                    HandleCombatInputs();
                    break;
                case PlayerState.Roll:
                    HandleRoll(Time.deltaTime);
                    break;
                case PlayerState.Attack:
                    HandleAttack(Time.deltaTime);
                    break;
                case PlayerState.Parry:
                    HandleParry(Time.deltaTime);
                    break;
                case PlayerState.DrinkEstus:
                    HandleDrinkEstus(Time.deltaTime);
                    break;
                case PlayerState.Stagger:
                    HandleStagger(Time.deltaTime);
                    break;
            }
        }

        private void HandleMouseOrbit()
        {
            if (Cursor.lockState != CursorLockMode.Locked) return;

            float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

            transform.Rotate(Vector3.up * mouseX);

            if (cameraPivot != null)
            {
                cameraPitch = Mathf.Clamp(cameraPitch - mouseY, -40f, 65f);
                cameraPivot.localEulerAngles = new Vector3(cameraPitch, 0f, 0f);
            }
        }

        private void HandleStamina(float dt)
        {
            if (staminaDelay > 0f)
            {
                staminaDelay -= dt;
            }
            else if (currentStamina < maxStamina)
            {
                float rate = (State == PlayerState.Block) ? staminaRegenRate * 0.4f : staminaRegenRate;
                currentStamina = Mathf.Min(maxStamina, currentStamina + rate * dt);
                OnStaminaChanged?.Invoke(currentStamina, maxStamina);
            }
        }

        private void HandleMovement(float dt)
        {
            float h = Input.GetAxisRaw("Horizontal");
            float v = Input.GetAxisRaw("Vertical");
            Vector3 inputDir = new Vector3(h, 0f, v).normalized();

            if (inputDir.magnitude > 0.05f)
            {
                bool isSprinting = Input.GetKey(KeyCode.LeftShift) && currentStamina > 10f;
                float speed = isSprinting ? sprintSpeed : (State == PlayerState.Block ? walkSpeed * 0.5f : walkSpeed);

                if (isSprinting)
                {
                    currentStamina = Mathf.Max(0f, currentStamina - 18f * dt);
                    staminaDelay = 0.4f;
                    OnStaminaChanged?.Invoke(currentStamina, maxStamina);
                }

                Vector3 targetMove = (transform.forward * v + transform.right * h).normalized * speed;
                moveDirection = targetMove;
                State = PlayerState.Locomotion;
            }
            else
            {
                moveDirection = Vector3.Lerp(moveDirection, Vector3.zero, dt * 10f);
                State = PlayerState.Idle;
            }

            // Gravity
            if (controller.isGrounded)
            {
                verticalVelocity = -2f;
            }
            else
            {
                verticalVelocity -= gravity * dt;
            }

            Vector3 finalVelocity = moveDirection + Vector3.up * verticalVelocity;
            controller.Move(finalVelocity * dt);
        }

        private void HandleCombatInputs()
        {
            if (Input.GetKeyDown(KeyCode.Space) && currentStamina >= 24f)
            {
                StartRoll();
            }
            else if (Input.GetMouseButtonDown(0) && currentStamina >= 20f)
            {
                StartAttack(1);
            }
            else if (Input.GetKeyDown(KeyCode.K) && currentStamina >= 35f)
            {
                StartAttack(3); // Heavy Attack
            }
            else if (Input.GetMouseButton(1) && currentStamina >= 10f)
            {
                State = PlayerState.Block;
                if (shieldMesh != null) shieldMesh.transform.localPosition = new Vector3(0f, 0.2f, 0.4f);
            }
            else if (Input.GetMouseButtonUp(1) && State == PlayerState.Block)
            {
                State = PlayerState.Idle;
                if (shieldMesh != null) shieldMesh.transform.localPosition = new Vector3(-0.35f, 0f, 0.2f);
            }
            else if (Input.GetKeyDown(KeyCode.Q) && currentStamina >= 18f)
            {
                StartParry();
            }
            else if (Input.GetKeyDown(KeyCode.R) || Input.GetKeyDown(KeyCode.Alpha1))
            {
                StartDrinkEstus();
            }
        }

        private void StartRoll()
        {
            State = PlayerState.Roll;
            stateTimer = 0f;
            currentStamina = Mathf.Max(0f, currentStamina - 24f);
            staminaDelay = 0.5f;
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);

            Vector3 horizontalMove = new Vector3(moveDirection.x, 0f, moveDirection.z);
            rollDirection = horizontalMove.magnitude > 0.1f ? horizontalMove.normalized : transform.forward;
        }

        private void HandleRoll(float dt)
        {
            stateTimer += dt;
            // Invulnerability frames: 0.08s - 0.40s
            IsInvincible = (stateTimer >= 0.08f && stateTimer <= 0.40f);

            float speed = rollSpeed * (1f - (stateTimer / 0.6f));
            controller.Move(rollDirection * speed * dt + Vector3.up * verticalVelocity * dt);

            if (stateTimer >= 0.55f)
            {
                IsInvincible = false;
                State = PlayerState.Idle;
            }
        }

        private void StartAttack(int combo)
        {
            State = PlayerState.Attack;
            attackCombo = combo;
            stateTimer = 0f;
            float cost = (combo == 3) ? 36f : 22f;
            currentStamina = Mathf.Max(0f, currentStamina - cost);
            staminaDelay = 0.6f;
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);

            CheckAttackHit();
        }

        private void HandleAttack(float dt)
        {
            stateTimer += dt;
            float duration = (attackCombo == 3) ? 0.7f : 0.45f;
            if (stateTimer >= duration)
            {
                State = PlayerState.Idle;
            }
        }

        private void CheckAttackHit()
        {
            float radius = (attackCombo == 3) ? 2.5f : 2.0f;
            float damage = (attackCombo == 3) ? 280f : 150f;

            Collider[] hits = Physics.OverlapSphere(transform.position + transform.forward * 1.5f, radius, enemyLayers);
            foreach (var hit in hits)
            {
                if (hit.TryGetComponent<EnemyHollow>(out var enemy))
                {
                    enemy.TakeDamage(damage, transform.position);
                }
                else if (hit.TryGetComponent<BossTaurus>(out var boss))
                {
                    boss.TakeDamage(damage, transform.position);
                }
            }
        }

        private void StartParry()
        {
            State = PlayerState.Parry;
            stateTimer = 0f;
            currentStamina = Mathf.Max(0f, currentStamina - 18f);
            staminaDelay = 0.6f;
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);
        }

        private void HandleParry(float dt)
        {
            stateTimer += dt;
            if (stateTimer >= 0.45f)
            {
                State = PlayerState.Idle;
            }
        }

        private void StartDrinkEstus()
        {
            if (estusFlasks <= 0)
            {
                OnNotification?.Invoke("NO ESTUS REMAINING");
                return;
            }
            if (currentHealth >= maxHealth)
            {
                OnNotification?.Invoke("HEALTH ALREADY FULL");
                return;
            }

            State = PlayerState.DrinkEstus;
            stateTimer = 0f;
            estusFlasks--;
            OnEstusChanged?.Invoke(estusFlasks, maxEstusFlasks);
        }

        private void HandleDrinkEstus(float dt)
        {
            stateTimer += dt;
            if (stateTimer >= 0.6f && currentHealth < maxHealth)
            {
                float heal = maxHealth * 0.65f;
                currentHealth = Mathf.Min(maxHealth, currentHealth + heal);
                OnHealthChanged?.Invoke(currentHealth, maxHealth);
                OnNotification?.Invoke("+650 HP RESTORED");
            }

            if (stateTimer >= 1.2f)
            {
                State = PlayerState.Idle;
            }
        }

        private void HandleStagger(float dt)
        {
            stateTimer -= dt;
            if (stateTimer <= 0f)
            {
                State = PlayerState.Idle;
            }
        }

        public void TakeDamage(float amount, Vector3 attackerPos)
        {
            if (State == PlayerState.Dead || IsInvincible) return;

            // Parry timing window (0.05s to 0.28s)
            if (State == PlayerState.Parry && stateTimer >= 0.05f && stateTimer <= 0.28f)
            {
                OnNotification?.Invoke("PARRY! ENEMY STAGGERED!");
                return;
            }

            // Shield Block
            if (State == PlayerState.Block && currentStamina > 15f)
            {
                Vector3 toAttacker = (attackerPos - transform.position).normalized;
                if (Vector3.Dot(transform.forward, toAttacker) > 0.3f)
                {
                    float stamCost = amount * 0.35f;
                    currentStamina = Mathf.Max(0f, currentStamina - stamCost);
                    staminaDelay = 0.8f;
                    OnStaminaChanged?.Invoke(currentStamina, maxStamina);

                    if (currentStamina <= 0f)
                    {
                        State = PlayerState.Stagger;
                        stateTimer = 1.2f;
                        OnNotification?.Invoke("GUARD BROKEN!");
                    }
                    return;
                }
            }

            // Direct Hit
            currentHealth = Mathf.Max(0f, currentHealth - amount);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);

            if (currentHealth <= 0f)
            {
                Die();
            }
            else
            {
                State = PlayerState.Stagger;
                stateTimer = 0.4f;
            }
        }

        private void Die()
        {
            State = PlayerState.Dead;
            OnPlayerDied?.Invoke();
        }

        public void RestAtBonfire(Vector3 bonfirePosition)
        {
            currentHealth = maxHealth;
            currentStamina = maxStamina;
            estusFlasks = maxEstusFlasks;
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);
            OnEstusChanged?.Invoke(estusFlasks, maxEstusFlasks);
            OnNotification?.Invoke("BONFIRE LIT • RESTED");
        }

        public void AddSouls(int amount)
        {
            souls += amount;
            OnSoulsChanged?.Invoke(souls);
            OnNotification?.Invoke($"+{amount} SOULS ACQUIRED");
        }
    }
}
