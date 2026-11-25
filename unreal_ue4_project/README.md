# Dark Souls Game — Unreal Engine 4.27 Project (Build V72)

Complete 3D Dark Souls Action RPG project upgraded to **Unreal Engine 4.27** (the final LTS release of UE4).

## ✨ Build V72 Features
- **60 FPS Smoothed Frame Rate & Streaming (`DefaultEngine.ini`)**:
  - Locked `60–120 FPS` smoothed range, optimized HLOD, and 2 GB streaming pool.
- **5x Colossal Map & 226,085 Spatial Locations (`ADarkSoulsGameMode`)**:
  - Procedurally indexes `226,085` fast-travel sectors across a `5x` expanded Lordran realm (`720km` breadth) using an O(1) `TMap<FIntVector, TArray<int32>>` spatial hash grid.
- **Player Character (`ADarkSoulsCharacter`)**:
  - `1200` HP, `160` Stamina, `100` Poise with **45% Anti-Stunlock Recovery** (`0.5s` delay, `45/s` regen).
  - **6 Sacred Covenants (`ESacredCovenant`)** with combat defense multipliers.
  - Subterranean-safe Abyss Rescue (`Z < GroundZ - 2500cm || Z < -9500cm`) and Boss Respawn Safety (`RespawnPlayerSafely()`).
  - Dodge Roll i-frames (`0.08s – 0.40s`), light/heavy combos, block, parry, lock-on, and Estus Flasks.
- **5 Lordran Bosses (`ADarkSoulsBoss`)**:
  - Taurus Demon, Bell Gargoyle, Capra Demon, Great Grey Wolf Sif, and Gwyn, Lord of Cinder.

## 🚀 How to Open in Unreal Engine 4.27
1. Install **Unreal Engine 4.27.2** in Epic Games Launcher.
2. Right-click `DarkSoulsGame.uproject` -> **Generate Visual Studio project files** (Windows) or **Generate Xcode project** (macOS).
3. Build `Development Editor` and open `/Game/Maps/LordranArena`.
