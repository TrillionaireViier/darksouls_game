# DARK SOULS: Lords of Lordran (Standalone Web & Desktop Edition)

An authentic, fully playable 3D Dark Souls experience built with WebGL and Three.js, featuring procedural animations, custom Web Audio synthesis, 5 iconic boss fights, and true Soulslike combat mechanics.

---

## 🎮 How to Play Offline
1. Unzip `darksouls_game_standalone.zip`.
2. Double-click `index.html` in any modern web browser (Google Chrome, Firefox, Microsoft Edge, Brave, Safari, or Opera).
3. No installation, server, or internet connection required!

---

## ⚔️ Combat & Dodge Roll ("Перекаты") Controls

### Keyboard & Mouse
- **W, A, S, D**: Move Character
- **Mouse**: Orbit Camera (Click canvas to capture mouse / Pointer Lock)
- **Space / Left Shift (with movement)**: **Directional Dodge Roll (Перекат)** with true 360° somersault, i-frames (неуязвимость), body tuck, and ethereal ghost trail.
- **Space / Left Shift (neutral / stationary)**: **Dark Souls Backstep (Отскок назад)** — rapid backward hop with i-frames, ready for counter-attacks.
- **Roll Cancel**: Cancel attack recovery animations directly into a dodge roll for responsive combat.
- **Left Mouse Button (LMB) or J**: Light Attack (2-Hit Combo)
- **Right Mouse Button (RMB) or K**: Hold to Block with Shield
- **Q or Tab**: Shield Parry (Deflect incoming attack to stagger enemy)
- **E**: Interact (Rest at Bonfire / Traverse Fog Gate)
- **R or 1**: Drink Estus Flask (+65% Max HP restore)
- **F or Middle Mouse Button**: Lock-on Target
- **Critical Attacks**:
  - **Backstab**: Attack an enemy from directly behind.
  - **Riposte**: Attack immediately after parrying an enemy.

### Mobile & Touch Devices
- Virtual joystick on bottom left for 360° movement.
- Dedicated action buttons on bottom right for Attack, Heavy, Block, Roll, Estus, Parry, Lock-on, and Interact.

---

## 👹 5 Lords of Lordran (Boss Roster)
Use the **⚔️ BOSS ROSTER** button or the **Bonfire Altar** to challenge any of the 5 legendary bosses:

1. **Taurus Demon (Демон Телец)** — Undead Burg Bridge
   - *Weapon*: Massive Stone Club & Spiked Greathammer
   - *Abilities*: Ground slam shockwave, wide cleave, enraged Phase 2 lava eruption.
   - *Reward*: 5,000 Souls

2. **Bell Gargoyle (Колокольная Гаргулья)** — Undead Parish Belfry
   - *Weapon*: Bronze Halberd, Bladed Stone Tail-Axe, Wing Flap
   - *Abilities*: Aerial thrusts, continuous stream of fiery dragon breath (`playFireBreath()`), tail-axe sweep.
   - *Reward*: 7,500 Souls

3. **Capra Demon (Демон Капра)** — Lower Undead Burg
   - *Weapon*: Dual Jagged Demon Great Machetes
   - *Abilities*: Leaping dual overhead crush (`playBossSlam()`), alternating double cleaver flurry, berserk bloodlust.
   - *Reward*: 8,000 Souls

4. **Great Grey Wolf Sif (Великий Волк Сиф)** — Darkroot Garden
   - *Weapon*: Knight Artorias's Colossal Silver Greatsword held horizontally in jaws
   - *Abilities*: 360° Greatsword Whirlwind Spin, leaping pounce slash, wolf howls (`playWolfHowl()`), Phase 2 double whirlwind.
   - *Reward*: 12,000 Souls

5. **Gwyn, Lord of Cinder (Гвин Повелитель Пепла)** — Kiln of the First Flame
   - *Weapon*: Flaming Sunlight Greatsword & Golden Sun Crown
   - *Abilities*: Relentless 3-hit flaming sword flurry, 360° radiant Sunlight Burst shockwave (`playSunlightFlame()`), lunging flame thrust.
   - *Reward*: 20,000 Souls

---

## 🔥 Features
- **Undead Merchant & Wares Shop (Торговец Нежити)**:
  - Atmospheric NPC merchant seated on an oriental rug by crates of wares and a golden lantern near the Bonfire.
  - Interactive prompt `[ E ] TALK TO UNDEAD MERCHANT` opening the authentic Peddler Shop with dialogue.
  - Sells iconic weapons, permanent Estus Shard upgrades (+1 max flasks), Divine Blessings, Charcoal Pine Resin (fire buff), and Homeward Bones.

- **Weapons Arsenal System (6 Легендарных Оружий)**:
  - **Astora Straight Sword**: Balanced divine blade, fast responsive slashes.
  - **Zweihander**: Colossal ultra greatsword, massive 4.4m reach, devastating poise stagger.
  - **Uchigatana**: Eastern curved katana with 1.35x attack speed and high backstab crits.
  - **Black Knight Halberd**: Extreme 4.8m attack reach for striking enemies from safe distance.
  - **Dragon Tooth**: Prehistoric fossilized dragon tooth club triggering ground shockwave bursts.
  - **Moonlight Greatsword**: Luminous crystal relic unleashing glowing crescent moonlight projectile waves on heavy attacks.
  - Real-time cycling via **[ 2 ] / [ X ]**, equipment D-pad click, or **`⚔️ WEAPONS`** header menu.

- **High-Visibility Lighting & Brightness Toggle (Улучшенная Видимость)**:
  - Eliminated pitch-black voids with warm-cool hemisphere fill light, bright moonlight (`1.45`), and linear distance fog (45m crystal clear).
  - Attached player lantern providing 360° personal illumination wherever you explore.
  - Added perimeter courtyard braziers and brighter torch illumination.
  - Added header **`☀️ CLEAR / BRIGHT+ / TWILIGHT`** lighting toggle button.

- **Save & Load Progress System (Архив Путешествия)**:
  - Persistent save state stored directly in browser local storage (`localStorage`).
  - **Auto-Save**: Triggers automatically on Bonfire rest, boss defeat, and stat upgrades.
  - **Manual Save / Load**: Easily accessible from the top header (`💾 SAVE` / `📂 LOAD`) and inside the Bonfire Altar.
  - Preserves Soul Level, souls inventory, stats (Vigor, Endurance, Strength), current/max HP and stamina, Estus flasks, active boss, and list of slain lords.
  - Boss Roster automatically tracks defeated bosses with a golden `[✓ LORD SLAIN]` badge and re-fight options.
  - Auto-restores your journey upon returning to the game.

- **HD Remaster Mod Textures (Текстурный Мод Высокого Разрешения)**:
  - 1024x1024 procedural gothic flagstone floor with individual slate, basalt, and granite variations, chiseled bevel edge relief, normal bump map (`bumpScale: 0.08`), and damp surface specular sheen.
  - 1024x1024 gothic castle ashlar fortress wall textures with mortar courses, chisel striations, vertical rainwater seepage, and deep mortar bump mapping.
  - Boss Arena scorched & bloodstained floor with coagulated blood pools, splatter droplets, and radiant magma ember fissure veins (`emissiveMap`).
  - Astora Crest Shield with hand-crafted heraldic silver falcon, holy cross, golden filigree rim, and battle wear scratches.
  - Brushed steel armor plates with directional hairline scratches, fluted ridges, and sharpened sword edge specular highlights.
  - Cinematic ACES Filmic Tone Mapping with enhanced dynamic range lighting.

- **The Bonfire & Boss Selector**:
  - Rest to restore full HP and refill 5 Estus Flasks.
  - Level-Up menu to upgrade Vigor (HP), Endurance (Stamina), and Strength (Damage) with Souls.
  - Fast Boss Selector to instantly switch bosses and warp to the arena.
- **The Fog Gate**:
  - Atmospheric barrier separating the ramparts from the arena.
  - Press `[ E ]` to traverse through the white light.
- **Cinematic Banners & Audio**:
  - Authentic "BONFIRE LIT", "YOU DIED", and "VICTORY ACHIEVED" screen banners with defeated boss names.
  - Pure procedural Web Audio API sound effects (sword clangs, parry bell chimes, wolf howls, flame breath, sunlight bursts, and ambient gothic music).

Developed by VIIER Agency • TrillionaireViier • Dark Souls Project © 2026
