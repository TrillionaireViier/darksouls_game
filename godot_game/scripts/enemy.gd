extends CharacterBody3D
class_name DarkSoulsEnemy

signal enemy_defeated(souls: int)

enum AIState {
	PATROL,
	CHASE,
	ATTACK,
	STAGGER,
	RIPOSTEABLE,
	DEAD
}

@export var max_health: float = 320.0
@export var health: float = 320.0
@export var damage: float = 115.0
@export var soul_reward: int = 150
@export var move_speed: float = 2.4
@export var aggro_radius: float = 14.0
@export var attack_radius: float = 2.0

var current_state: AIState = AIState.PATROL
var target_player: DarkSoulsPlayer = null
var spawn_position: Vector3
var cooldown: float = 0.0
var state_timer: float = 0.0

@onready var anim_tree = $AnimationPlayer if has_node("AnimationPlayer") else null

func _ready() -> void:
	spawn_position = global_position
	health = max_health

func _physics_process(delta: float) -> void:
	if current_state == AIState.DEAD:
		return

	if not is_on_floor():
		velocity.y -= 19.6 * delta
	else:
		velocity.y = 0.0

	update_ai(delta)
	move_and_slide()

func update_ai(delta: float) -> void:
	if cooldown > 0.0:
		cooldown -= delta

	if current_state == AIState.STAGGER or current_state == AIState.RIPOSTEABLE:
		state_timer -= delta
		if state_timer <= 0.0:
			current_state = AIState.CHASE
		return

	if not target_player:
		# Search for player
		var players = get_tree().get_nodes_in_group("player")
		if players.size() > 0:
			target_player = players[0]
		return

	var dist = global_position.distanceTo(target_player.global_position)

	if dist <= aggro_radius:
		# Chase player
		look_at(Vector3(target_player.global_position.x, global_position.y, target_player.global_position.z), Vector3.UP)
		if dist > attack_radius:
			var dir = (target_player.global_position - global_position).normalized()
			dir.y = 0.0
			velocity.x = dir.x * move_speed
			velocity.z = dir.z * move_speed
			current_state = AIState.CHASE
		else:
			velocity.x = 0.0
			velocity.z = 0.0
			if cooldown <= 0.0:
				perform_attack()
	else:
		velocity.x = 0.0
		velocity.z = 0.0
		current_state = AIState.PATROL

func perform_attack() -> void:
	current_state = AIState.ATTACK
	cooldown = 1.8
	# Delay damage to match swing windup
	await get_tree().create_timer(0.3).timeout
	if current_state != AIState.DEAD and current_state != AIState.STAGGER and current_state != AIState.RIPOSTEABLE:
		if target_player and global_position.distanceTo(target_player.global_position) <= attack_radius + 0.5:
			target_player.take_damage(damage, global_position)
	current_state = AIState.CHASE

func take_damage(amount: float, attacker_pos: Vector3) -> void:
	if current_state == AIState.DEAD:
		return

	health = max(0.0, health - amount)
	if health <= 0.0:
		die()
	else:
		current_state = AIState.STAGGER
		state_timer = 0.45
		velocity = Vector3.ZERO

func die() -> void:
	current_state = AIState.DEAD
	velocity = Vector3.ZERO
	if target_player:
		target_player.add_souls(soul_reward)
	emit_signal("enemy_defeated", soul_reward)
	# Fade/sink
	var tween = create_tween()
	tween.tween_property(self, "position:y", position.y - 1.5, 1.2)
	tween.tween_callback(queue_free)

func reset_enemy() -> void:
	global_position = spawn_position
	health = max_health
	current_state = AIState.PATROL
	velocity = Vector3.ZERO
