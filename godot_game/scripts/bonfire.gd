extends Area3D
class_name DarkSoulsBonfire

signal bonfire_rested()

@export var is_lit: bool = true
var player_inside: DarkSoulsPlayer = null

@onready var fire_light: OmniLight3D = $OmniLight3D
@onready var fire_particles: GPUParticles3D = $GPUParticles3D
@onready var prompt_label: Label3D = $PromptLabel

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	if prompt_label:
		prompt_label.visible = false

func _process(delta: float) -> void:
	if fire_light:
		# Flicker flame
		var time = Time.get_ticks_msec() / 1000.0
		fire_light.light_energy = 2.4 + sin(time * 12.0) * 0.4 + cos(time * 23.0) * 0.2

	if player_inside and Input.is_action_just_pressed("interact"):
		trigger_rest()

func _on_body_entered(body: Node3D) -> void:
	if body is DarkSoulsPlayer:
		player_inside = body
		if prompt_label:
			prompt_label.visible = true

func _on_body_exited(body: Node3D) -> void:
	if body == player_inside:
		player_inside = null
		if prompt_label:
			prompt_label.visible = false

func trigger_rest() -> void:
	if player_inside:
		player_inside.rest_at_bonfire(global_position)
		emit_signal("bonfire_rested")
