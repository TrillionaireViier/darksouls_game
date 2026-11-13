extends Node3D

@onready var player: DarkSoulsPlayer = $Player
@onready var hud: DarkSoulsHUD = $HUD
@onready var bonfire: DarkSoulsBonfire = $Bonfire
@onready var boss: DarkSoulsBossTaurus = $BossTaurus
@onready var enemies_container: Node3D = $Enemies

func _ready() -> void:
	if player and hud:
		player.health_changed.connect(hud.update_health)
		player.stamina_changed.connect(hud.update_stamina)
		player.estus_changed.connect(hud.update_estus)
		player.souls_changed.connect(hud.update_souls)
		player.notification_triggered.connect(hud.show_notification)
		player.player_died.connect(hud.show_death_screen)

	if bonfire:
		bonfire.bonfire_rested.connect(_on_bonfire_rested)

	if boss and hud:
		boss.boss_awakened.connect(hud.show_boss_hud)
		boss.boss_health_changed.connect(hud.update_boss_health)
		boss.boss_defeated.connect(_on_boss_defeated)

	hud.show_notification("WELCOME TO LORDRAN. PREPARE TO DIE.")

func _on_bonfire_rested() -> void:
	hud.show_bonfire_lit()
	# Respawn/reset regular hollows
	for child in enemies_container.get_children():
		if child.has_method("reset_enemy"):
			child.reset_enemy()

func _on_boss_defeated(souls: int) -> void:
	hud.show_victory()

func _input(event: InputEvent) -> void:
	if player and player.current_state == DarkSoulsPlayer.State.DEAD:
		if event.is_action_pressed("roll") or (event is InputEventKey and event.pressed and event.keycode == KEY_SPACE):
			respawn_at_bonfire()

func respawn_at_bonfire() -> void:
	if bonfire and player:
		player.global_position = bonfire.global_position + Vector3(0, 0, 3)
		player.rest_at_bonfire(bonfire.global_position)
		hud.death_overlay.visible = false
		_on_bonfire_rested()
