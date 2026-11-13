# Dark Souls Game — Unreal Engine 4 Project (UE 4.22 – UE 4.24)

Complete 3D Dark Souls Action RPG project configured for **Unreal Engine 4.22, 4.23, and 4.24**.

## ✨ Features
- **Player Character (`ADarkSoulsCharacter`)**:
  - Full Dark Souls stamina-based combat (HP, Stamina, Souls, Estus Flasks).
  - **Dodge Roll with authentic i-frames (invulnerability window: 0.08s – 0.40s)**.
  - Light attack 3-hit combo & Heavy attack with stamina costs.
  - Shield blocking with stamina damage mitigation & Shield parrying with riposte stagger.
  - Target lock-on camera system.
  - Bonfire resting (HP/Estus refill, respawn logic).
- **5 Lordran Bosses (`ADarkSoulsBoss`)**:
  - **Taurus Demon** (2400 HP, giant greataxe slam, shockwave).
  - **Bell Gargoyle** (2100 HP, fire breath, halberd thrust, glide).
  - **Capra Demon** (1900 HP, dual machete jump smash, frenzy).
  - **Great Grey Wolf Sif** (2800 HP, 360° greatsword spin, sword leap).
  - **Gwyn, Lord of Cinder** (3400 HP, flaming sword combo, sunlight spear).
- **Dark Souls GameMode & HUD**:
  - Health & Stamina bars, Souls counter, Boss Health bar, "YOU DIED", and "VICTORY ACHIEVED" overlays.

## 🚀 How to Open in Unreal Engine 4 (4.22 – 4.24)

1. **Prerequisites**:
   - Unreal Engine **4.22.x**, **4.23.x**, or **4.24.x** installed via Epic Games Launcher.
   - Visual Studio 2017 or 2019 (with "Game development with C++") on Windows, or Xcode on macOS.

2. **Generate Project Files**:
   - Right-click `DarkSoulsGame.uproject` -> **Generate Visual Studio project files** (or run `UnrealVersionSelector`).

3. **Compile and Launch**:
   - Open `DarkSoulsGame.sln` in Visual Studio (or `.xcworkspace` in Xcode).
   - Set build configuration to `Development Editor` and platform `Win64` (or `Mac`).
   - Press **F5** or Build -> Build Solution.
   - Alternatively, double-click `DarkSoulsGame.uproject` to let Unreal Editor compile the C++ modules directly.

4. **Default Map**:
   - Open `/Game/Maps/LordranArena` and press **Play (Alt+P)**!
