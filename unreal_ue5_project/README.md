# Dark Souls: Warriors' Dream — Unreal Engine 5.8 Project (Build V72)

Complete 3D Dark Souls Action RPG project built for **Unreal Engine 5.8** (latest UE5 feature release — compatible with UE 5.5–5.9).

## ✨ Unreal Engine 5.8 Features
- **Lumen Lite & Nanite (60 FPS Target)** (`Config/DefaultEngine.ini`):
  - Virtual Shadow Maps, Nanite, and Lumen Lite tuned for locked 60–120 FPS performance.
- **Large World Coordinates (LWC) & World Partition (5x Map & 226,085+ Locations)**:
  - Double-precision `FVector` coordinates across the `5x` colossal `720km` realm.
  - O(1) `TMap<FIntVector, TArray<int32>>` spatial hash grid indexing `226,085` fast-travel locations in `ADarkSoulsGameMode`.
- **Enhanced Input + Zero-Setup Fallback** (`ADarkSoulsCharacter`):
  - Supports UE5 `EnhancedInputComponent` (`MoveAction`, `LookAction`, `DefaultMappingContext`) plus full fallback bindings in `Config/DefaultInput.ini`.
- **Upgraded Soulslike Combat & Safety Systems**:
  - `1200` HP, `160` Stamina, `100` Poise with **45% Anti-Stunlock Recovery** (`0.5s` delay, `45/s` regen).
  - **6 Sacred Covenants (`ESacredCovenant`)**.
  - Subterranean-safe Abyss Rescue & Boss Arena Respawn Safety (`RespawnPlayerSafely()`).
  - 5 Lordran Bosses (`ADarkSoulsBoss`): Taurus Demon, Bell Gargoyle, Capra Demon, Great Grey Wolf Sif, and Gwyn, Lord of Cinder.

## 🚀 How to Open in Unreal Engine 5.8
1. Install **Unreal Engine 5.8** via Epic Games Launcher.
2. Right-click `DarkSoulsGame.uproject` -> **Generate Visual Studio project files** (Windows) or **Generate Xcode project** (macOS).
3. Build `Development Editor` and open `/Game/Maps/LordranArena`.
