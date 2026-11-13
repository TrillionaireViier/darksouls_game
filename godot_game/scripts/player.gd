extends CharacterBody3D
class_name DarkSoulsPlayer

signal health_changed(current: float, max_val: float)
signal stamina_changed(current: float, max_val: float)
signal estus_changed(current: int, max_val: int)
signal souls_changed(amount: int)
signal player_died()
signal notification_triggered(message: String)

enum State {
	IDLE,
	MOVE,
	ROLL,
	ATTACK,
	BLOCK,
	PARRY,
	DRINK,
	STAGGER,
	DEAD
}

@export var max_health: float = 1000.0
@export var health: float = 1000.0
@export var max_stamina: float = 100.0
@export var stamina: float = 100.0
@export var stamina_regen: float = 38.0
@export var move_speed: float = 5.0
@export var sprint_speed: float = 7.5
@export var roll_speed: float = 9.0

var estus_flasks: int = 5
var max_estus: int = 5
var souls: int = 0
var current_state: State = State.IDLE

var stamina_delay: float = 0.0
var state_timer: float = 0.0
var attack_combo: int = 0
var is_invincible: bool = false
var roll_direction: Vector3 = Vector3.FORWARD

@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera: Camera3D = $CameraPivot/SpringArm3D/Camera3D
@onready var sword_hitbox: Area3D = $MeshRoot/RightHand/Sword/HitboxArea
@onready var shield_mesh: Node3D = $MeshRoot/LeftHand/Shield
@onready var anim_player: AnimationPlayer = $AnimationPlayer

var mouse_sensitivity: float = 0.003
var locked_target: Node3D = null

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	health = max_health
	stamina = max_stamina
	emit_signal("health_changed", health, max_health)
	emit_signal("stamina_changed", stamina, max_stamina)
	emit_signal("estus_changed", estus_flasks, max_estus)
	emit_signal("souls_changed", souls)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		if not locked_target:
			rotate_y(-event.relative.x * mouse_sensitivity)
			if camera_pivot:
				camera_pivot.rotate_x(-event.relative.y * mouse_sensitivity)
				camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, deg_to_rad(-45), deg_to_rad(65))
	
	if event.is_action_pressed("ui_cancel"):
		if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		else:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _physics_process(delta: float) -> void:
	if current_state == State.DEAD:
		return

	handle_stamina_regen(delta)
	update_state(delta)
	
	# Apply gravity
	if not is_on_floor():
		velocity.y -= 19.6 * delta
	else:
		velocity.y = 0.0

	move_and_slide()

func handle_stamina_regen(delta: float) -> void:
	if stamina_delay > 0.0:
		stamina_delay -= delta
	elif stamina < max_stamina:
		var rate = stamina_regen * (0.4 if current_state == State.BLOCK else 1.0)
		stamina = min(max_stamina, stamina + rate * delta)
		emit_signal("stamina_changed", stamina, max_stamina)

func update_state(delta: float) -> void:
	match current_state:
		State.IDLE, State.MOVE:
			handle_locomotion(delta)
			check_combat_inputs()
		State.ROLL:
			handle_roll(delta)
		State.ATTACK:
			handle_attack(delta)
		State.PARRY:
			handle_parry(delta)
		State.DRINK:
			handle_drink(delta)
		State.STAGGER:
			handle_stagger(delta)

func handle_locomotion(delta: float) -> void:
	var input_dir = Vector2(
		Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
		Input.get_action_strength("move_backward") - Input.get_action_strength("move_forward")
	).normalized()

	if input_dir.length() > 0.01:
		var forward = -transform.basis.z
		var right = transform.basis.x
		var move_vector = (right * input_dir.x + forward * -input_dir.y).normalized()

		var is_sprint = Input.is_key_pressed(KEY_SHIFT) and stamina > 10.0
		var speed = sprint_speed if is_sprint else move_speed

		if is_sprint:
			stamina = max(0.0, stamina - 16.0 * delta)
			stamina_delay = 0.4
			emit_signal("stamina_changed", stamina, max_stamina)

		velocity.x = move_vector.x * speed
		velocity.z = move_vector.z * speed
		current_state = State.MOVE
	else:
		velocity.x = move_toward(velocity.x, 0.0, 15.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, 15.0 * delta)
		current_state = State.IDLE

func check_combat_inputs() -> void:
	if Input.is_action_just_pressed("roll") and stamina >= 24.0:
		start_roll()
	elif Input.is_action_just_pressed("attack") and stamina >= 20.0:
		start_attack(1)
	elif Input.is_action_just_pressed("heavy_attack") and stamina >= 35.0:
		start_attack(3)
	elif Input.is_action_pressed("block") and stamina >= 10.0:
		current_state = State.BLOCK
	elif Input.is_action_just_released("block") and current_state == State.BLOCK:
		current_state = State.IDLE
	elif Input.is_action_just_pressed("parry") and stamina >= 18.0:
		start_parry()
	elif Input.is_action_just_pressed("estus"):
		start_drink_estus()

func start_roll() -> void:
	current_state = State.ROLL
	state_timer = 0.0
	stamina = max(0.0, stamina - 24.0)
	stamina_delay = 0.5
	emit_signal("stamina_changed", stamina, max_stamina)

	var move_h = Vector3(velocity.x, 0, velocity.z)
	if move_h.length() > 0.1:
		roll_direction = move_h.normalized()
	else:
		roll_direction = -transform.basis.z

	velocity = roll_direction * roll_speed

func handle_roll(delta: float) -> void:
	state_timer += delta
	# Invulnerability frames: 0.1s to 0.4s
	is_invincible = state_timer >= 0.08 and state_timer <= 0.40
	velocity = roll_direction * (roll_speed * (1.0 - state_timer / 0.6))

	if state_timer >= 0.55:
		is_invincible = false
		current_state = State.IDLE

func start_attack(combo: int) -> void:
	current_state = State.ATTACK
	attack_combo = combo
	state_timer = 0.0
	var cost = 35.0 if combo == 3 else 22.0
	stamina = max(0.0, stamina - cost)
	stamina_delay = 0.6
	emit_signal("stamina_changed", stamina, max_stamina)
	velocity = Vector3.ZERO
	check_sword_hit()

func handle_attack(delta: float) -> void:
	state_timer += delta
	var max_dur = 0.7 if attack_combo == 3 else 0.45
	if state_timer >= max_dur:
		current_state = State.IDLE

func check_sword_hit() -> void:
	var damage = 280.0 if attack_combo == 3 else 150.0
	if sword_hitbox:
		var bodies = sword_hitbox.get_overlapping_bodies()
		for b in bodies:
			if b.has_method("take_damage") and b != self:
				b.take_damage(damage, global_position)

func start_parry() -> void:
	current_state = State.PARRY
	state_timer = 0.0
	stamina = max(0.0, stamina - 18.0)
	stamina_delay = 0.6
	emit_signal("stamina_changed", stamina, max_stamina)

func handle_parry(delta: float) -> void:
	state_timer += delta
	if state_timer >= 0.45:
		current_state = State.IDLE

func start_drink_estus() -> void:
	if estus_flasks <= 0:
		emit_signal("notification_triggered", "NO ESTUS FLASKS REMAINING")
		return
	if health >= max_health:
		emit_signal("notification_triggered", "HEALTH FULL")
		return

	current_state = State.DRINK
	state_timer = 0.0
	estus_flasks -= 1
	emit_signal("estus_changed", estus_flasks, max_estus)
	velocity = Vector3.ZERO

func handle_drink(delta: float) -> void:
	state_timer += delta
	if state_timer >= 0.6 and health < max_health:
		var heal_val = max_health * 0.65
		health = min(max_health, health + heal_val)
		emit_signal("health_changed", health, max_health)
		emit_signal("notification_triggered", "+650 HP RESTORED")

	if state_timer >= 1.2:
		current_state = State.IDLE

func handle_stagger(delta: float) -> void:
	state_timer -= delta
	if state_timer <= 0.0:
		current_state = State.IDLE

func take_damage(amount: float, attacker_pos: Vector3) -> void:
	if current_state == State.DEAD or is_invincible:
		return

	# Check Parry
	if current_state == State.PARRY and state_timer >= 0.05 and state_timer <= 0.28:
		emit_signal("notification_triggered", "PARRY! ENEMY STUNNED!")
		return

	# Check Block
	if current_state == State.BLOCK and stamina > 15.0:
		var forward = -transform.basis.z
		var to_attacker = (attacker_pos - global_position).normalized()
		if forward.dot(to_attacker) > 0.3:
			var stam_cost = amount * 0.35
			stamina = max(0.0, stamina - stam_cost)
			stamina_delay = 0.8
			emit_signal("stamina_changed", stamina, max_stamina)
			if stamina <= 0.0:
				current_state = State.STAGGER
				state_timer = 1.2
				emit_signal("notification_triggered", "GUARD BROKEN!")
			return

	# Take full hit
	health = max(0.0, health - amount)
	emit_signal("health_changed", health, max_health)

	if health <= 0.0:
		die()
	else:
		current_state = State.STAGGER
		state_timer = 0.4

func die() -> void:
	current_state = State.DEAD
	velocity = Vector3.ZERO
	emit_signal("player_died")

func rest_at_bonfire(bonfire_pos: Vector3) -> void:
	health = max_health
	stamina = max_stamina
	estus_flasks = max_estus
	emit_signal("health_changed", health, max_health)
	emit_signal("stamina_changed", stamina, max_stamina)
	emit_signal("estus_changed", estus_flasks, max_estus)
	emit_signal("notification_triggered", "BONFIRE LIT • RESTED")

func add_souls(amount: int) -> void:
	souls += amount
	emit_signal("souls_changed", souls)
	emit_signal("notification_triggered", "+" + str(amount) + " SOULS ACQUIRED")
