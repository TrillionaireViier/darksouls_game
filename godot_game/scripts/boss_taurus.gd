extends CharacterBody3D
class_name DarkSoulsBossTaurus

signal boss_health_changed(current: float, max_val: float)
signal boss_awakened(boss_name: String)
signal boss_defeated(souls: int)

enum BossState {
	SLEEP,
	CHASE,
	SLAM_ATTACK,
	SWEEP_ATTACK,
	ENRAGE_ROAR,
	DEAD
}

@export var max_health: float = 2200.0
@export var health: float = 2200.0
@export var damage: float = 280.0
@export var soul_reward: int = 5000
@export var move_speed: float = 2.6

var current_state: BossState = BossState.SLEEP
var is_phase2: bool = false
var target_player: DarkSoulsPlayer = null
var cooldown: float = 0.0

@onready var weapon_fire_light: OmniLight3D = $MeshRoot/RightArm/Weapon/FireLight if has_node("MeshRoot/RightArm/Weapon/FireLight") else null

func _ready() -> void:
	health = max_health

func _physics_process(delta: float) -> void:
	if current_state == BossState.DEAD:
		return

	if not is_on_floor():
		velocity.y -= 19.6 * delta
	else:
		velocity.y = 0.0

	update_boss(delta)
	move_and_slide()

func update_boss(delta: float) -> void:
	if not target_player:
		var players = get_tree().get_nodes_in_group("player")
		if players.size() > 0:
			target_player = players[0]
		return

	var dist = global_position.distanceTo(target_player.global_position)

	# Awakening when player enters bridge arena
	if current_state == BossState.SLEEP:
		if target_player.global_position.z > 95.0 or dist < 25.0:
			awaken()
		return

	if cooldown > 0.0:
		cooldown -= delta

	# Look towards player
	look_at(Vector3(target_player.global_position.x, global_position.y, target_player.global_position.z), Vector3.UP)

	if current_state == BossState.CHASE:
		if dist > 4.2:
			var speed = move_speed * (1.3 if is_phase2 else 1.0)
			var dir = (target_player.global_position - global_position).normalized()
			dir.y = 0.0
			velocity.x = dir.x * speed
			velocity.z = dir.z * speed
		else:
			velocity.x = 0.0
			velocity.z = 0.0
			if cooldown <= 0.0:
				choose_attack()

func awaken() -> void:
	current_state = BossState.CHASE
	emit_signal("boss_awakened", "TAURUS DEMON")
	emit_signal("boss_health_changed", health, max_health)

func choose_attack() -> void:
	cooldown = 2.2 if is_phase2 else 2.8
	if randf() > 0.5:
		perform_slam()
	else:
		perform_sweep()

func perform_slam() -> void:
	current_state = BossState.SLAM_ATTACK
	velocity = Vector3.ZERO
	await get_tree().create_timer(0.75).timeout
	if current_state != BossState.DEAD:
		# Check radius
		if target_player and global_position.distanceTo(target_player.global_position) <= 5.0:
			target_player.take_damage(damage, global_position)
	current_state = BossState.CHASE

func perform_sweep() -> void:
	current_state = BossState.SWEEP_ATTACK
	velocity = Vector3.ZERO
	await get_tree().create_timer(0.6).timeout
	if current_state != BossState.DEAD:
		if target_player and global_position.distanceTo(target_player.global_position) <= 4.2:
			target_player.take_damage(damage * 0.8, global_position)
	current_state = BossState.CHASE

func take_damage(amount: float, attacker_pos: Vector3) -> void:
	if current_state == BossState.DEAD:
		return

	if current_state == BossState.SLEEP:
		awaken()

	health = max(0.0, health - amount)
	emit_signal("boss_health_changed", health, max_health)

	# Trigger Phase 2 at 50% HP
	if health <= max_health * 0.5 and not is_phase2:
		trigger_phase2()

	if health <= 0.0:
		die()

func trigger_phase2() -> void:
	is_phase2 = true
	current_state = BossState.ENRAGE_ROAR
	velocity = Vector3.ZERO
	if weapon_fire_light:
		weapon_fire_light.visible = true
	await get_tree().create_timer(1.2).timeout
	current_state = BossState.CHASE

func die() -> void:
	current_state = BossState.DEAD
	velocity = Vector3.ZERO
	if target_player:
		target_player.add_souls(soul_reward)
	emit_signal("boss_defeated", soul_reward)
	var tween = create_tween()
	tween.tween_property(self, "position:y", position.y - 3.0, 2.5)
	tween.tween_callback(queue_free)
