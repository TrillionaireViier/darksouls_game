# Dark Souls: Lordran Remastered (Godot 4 Project)

A complete 3D Soulslike Action RPG project created for **Godot 4.x** (compatible with 4.0 - 4.7+).

## 🚀 How to Open and Run in Godot:
1. Open the **Godot Engine 4** Project Manager.
2. Click **Import** and browse to this folder, selecting `project.godot`.
3. Press **Run Project (F5)** or open `scenes/main_world.tscn`.

## ⚔️ Included Features & Architecture:
- **Player Controller (`scripts/player.gd`)**:
  - Full 3D CharacterBody3D with spring arm third-person camera.
  - Stamina management system with regenerative cooldowns.
  - Dodge roll with true invulnerability frames (i-frames).
  - Light & heavy sword attack combos with Area3D hit detection.
  - Shield blocking (stamina absorption & guard break).
  - Timed parry window with visual/audio feedback.
  - Estus Flask healing system (restores 65% HP).
  - Souls accumulation economy.
- **The Bonfire (`scripts/bonfire.gd`)**:
  - Interactive rest checkpoint (`[E] Rest`).
  - Restores player HP and replenishes Estus flasks.
  - Triggers enemy respawn across the citadel.
  - Emits the classic "BONFIRE LIT" gold banner.
- **Enemy AI (`scripts/enemy.gd`)**:
  - Undead Hollow soldiers with perception radius, patrol, and aggressive lunge attacks.
  - Poise damage, hit stagger, and soul drops upon defeat.
- **Boss Encounter (`scripts/boss_taurus.gd`)**:
  - The Taurus Demon guarding the citadel bridge.
  - 2-Phase combat system with ground slam, sweep cleave, and fiery enrage below 50% HP.
  - Dynamic boss health bar with damage indicators.
- **Gothic HUD (`scripts/hud.gd`)**:
  - Crimson Health bar, Green Stamina bar, Estus counter, Souls odometer.
  - "YOU DIED", "BONFIRE LIT", and "VICTORY ACHIEVED" overlays.
