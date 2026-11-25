# Dark Souls: Warriors' Dream (Unity 6.3 LTS Edition — Build V72)

An authentic 3D Soulslike Action RPG project upgraded for **Unity 6.3 LTS (`6000.3.0f1`)** (compatible with Unity 6.0–6.7 and URP 17).

## 🚀 Getting Started in Unity 6:
1. Open **Unity Hub** (install **Unity 6.3 LTS / 6000.3.0f1**).
2. Click **Add > Add project from disk** and select this `unity_game` folder.
3. Unity will resolve `Packages/manifest.json` (URP 17, New Input System, uGUI, AI Navigation).
4. Open or create your scene and attach `DarkSoulsGameManager`, `WorldChunkStreamer`, `CovenantSystem`, `DarkSoulsPlayer`, and `DarkSoulsHUD`.
5. Press **Play** to test 60 FPS chunk streaming, 5x expanded zones, 226,085+ spatial locations, and Soulslike combat!

## ✨ Included Build V72 Features:
- **60 FPS Spatial Chunk Streamer (`WorldChunkStreamer.cs`)**:
  - `Application.targetFrameRate = 60` with `2500m x 2500m` `3x3` active chunk streaming and pooled 6-`PointLight` lighting.
  - **5x Colossal Map Expansion** (`720km` breadth, 5x Courtyard / Royal Bridge / Colosseum Boss Arena) & **226,085+ Fast-Travel Locations** indexed in an O(1) spatial hash grid.
- **Unity 6 Player Controller (`DarkSoulsPlayer.cs`)**:
  - Updated to `FindFirstObjectByType<T>()` (zero Unity 6 deprecation warnings).
  - **Anti-Stunlock Poise Recovery**: 45% poise buffer on stagger, `0.5s` delay, `45/s` regen rate.
  - **Subterranean-Safe Abyss Rescue**: Checks relative ground height (`p.y < groundY - 25m || p.y < -95m`) before rescuing.
  - Dodge roll i-frames, shield block/parry, Estus healing (`1200` HP), and Souls economy.
- **6 Sacred Covenants (`CovenantSystem.cs`)**:
  - Warriors of Sunlight, Darkwraiths, Forest Hunters, Blade of the Darkmoon, Gravelord Servant, and Chaos Servant with combat multipliers.
- **5 Core Lordran Bosses + Hollow AI**:
  - `BossTaurus`, `BossGargoyle`, `BossCapra`, `BossSif`, `BossGwyn`, and `EnemyHollow` with Boss Arena Respawn Safety (`DarkSoulsGameManager.RespawnPlayerSafely()`).
