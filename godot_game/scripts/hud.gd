extends CanvasLayer
class_name DarkSoulsHUD

@onready var hp_bar: ProgressBar = $PlayerHUD/HPBar
@onready var stamina_bar: ProgressBar = $PlayerHUD/StaminaBar
@onready var estus_label: Label = $PlayerHUD/EstusContainer/EstusLabel
@onready var souls_label: Label = $SoulsContainer/SoulsLabel

@onready var boss_container: VBoxContainer = $BossHUD
@onready var boss_name_label: Label = $BossHUD/BossNameLabel
@onready var boss_hp_bar: ProgressBar = $BossHUD/BossBarFrame/BossHPBar

@onready var notification_label: Label = $NotificationLabel
@onready var death_overlay: Control = $DeathOverlay
@onready var bonfire_banner: Control = $BonfireBanner
@onready var victory_banner: Control = $VictoryBanner

func _ready() -> void:
	if boss_container:
		boss_container.visible = false
	if death_overlay:
		death_overlay.visible = false
	if bonfire_banner:
		bonfire_banner.visible = false
	if victory_banner:
		victory_banner.visible = false

func update_health(current: float, max_val: float) -> void:
	if hp_bar:
		hp_bar.max_value = max_val
		hp_bar.value = current

func update_stamina(current: float, max_val: float) -> void:
	if stamina_bar:
		stamina_bar.max_value = max_val
		stamina_bar.value = current

func update_estus(current: int, max_val: int) -> void:
	if estus_label:
		estus_label.text = "x " + str(current)

func update_souls(amount: int) -> void:
	if souls_label:
		souls_label.text = str(amount)

func show_notification(msg: String) -> void:
	if notification_label:
		notification_label.text = msg
		notification_label.visible = true
		var tween = create_tween()
		tween.tween_property(notification_label, "modulate:a", 1.0, 0.2)
		tween.tween_interval(2.5)
		tween.tween_property(notification_label, "modulate:a", 0.0, 0.4)
		tween.tween_callback(func(): notification_label.visible = false)

func show_boss_hud(boss_name: String) -> void:
	if boss_container:
		boss_name_label.text = boss_name
		boss_container.visible = true

func update_boss_health(current: float, max_val: float) -> void:
	if boss_hp_bar:
		boss_hp_bar.max_value = max_val
		boss_hp_bar.value = current

func show_death_screen() -> void:
	if death_overlay:
		death_overlay.visible = true
		death_overlay.modulate.a = 0.0
		var tween = create_tween()
		tween.tween_property(death_overlay, "modulate:a", 1.0, 1.8)

func show_bonfire_lit() -> void:
	if bonfire_banner:
		bonfire_banner.visible = true
		bonfire_banner.modulate.a = 0.0
		var tween = create_tween()
		tween.tween_property(bonfire_banner, "modulate:a", 1.0, 0.4)
		tween.tween_interval(2.2)
		tween.tween_property(bonfire_banner, "modulate:a", 0.0, 0.6)
		tween.tween_callback(func(): bonfire_banner.visible = false)

func show_victory() -> void:
	if boss_container:
		boss_container.visible = false
	if victory_banner:
		victory_banner.visible = true
		victory_banner.modulate.a = 0.0
		var tween = create_tween()
		tween.tween_property(victory_banner, "modulate:a", 1.0, 0.5)
		tween.tween_interval(3.5)
		tween.tween_property(victory_banner, "modulate:a", 0.0, 0.8)
		tween.tween_callback(func(): victory_banner.visible = false)
