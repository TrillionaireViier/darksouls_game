# Dark Souls: Lordran Remastered (Unity 3D Edition)

An authentic 3D Soulslike Action RPG project created for **Unity** (2021.3 LTS, 2022.3 LTS, or Unity 6+).

## 🚀 Getting Started in Unity:
1. Open **Unity Hub**.
2. Click **Add > Add project from disk** and choose this `unity_game` folder.
3. Open the project with Unity 2022.3+ (or your installed LTS version).
4. Open the scene in `Assets/Scenes/MainCitadel.unity`.
5. Press **Play** in the Unity Editor to immediately test combat and mechanics!

## ⚔️ Included Features & Architecture:
- **Player Controller (`DarkSoulsPlayer.cs`)**:
  - Full 3D CharacterController locomotion with mouse orbit.
  - Stamina management system with sprint, attack, roll, and block costs.
  - Dodge roll with true invulnerability frames (i-frames).
  - Light & heavy sword attack combos.
  - Shield blocking (stamina absorption & guard break).
  - Timed parry window.
  - Estus Flask healing (restores 65% HP).
  - Souls accumulation economy.
- **The Bonfire (`Bonfire.cs`)**:
  - Interactive rest checkpoint (`[E] Rest at Bonfire`).
  - Restores player HP and replenishes 5 Estus flasks.
  - Respawns all enemies in the scene.
  - Emits the classic "BONFIRE LIT" gold banner.
- **Enemy AI (`EnemyHollow.cs`)**:
  - Undead Hollow soldiers with perception radius, patrol, and aggressive lunge attacks.
  - Poise damage, hit stagger, and soul drops upon defeat.
- **Boss Encounter (`BossTaurus.cs`)**:
  - The Taurus Demon guarding the citadel bridge.
  - 2-Phase combat system with ground slam, sweep cleave, and fiery enrage below 50% HP.
  - Dynamic boss health bar with damage indicators.
- **Gothic HUD (`DarkSoulsHUD.cs`)**:
  - Crimson Health bar, Green Stamina bar, Estus counter, Souls odometer.
  - "YOU DIED", "BONFIRE LIT", and "VICTORY ACHIEVED" overlays.
