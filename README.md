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

- **Advanced Siege & Warfare Mechanics (391–400)**:
  - **391. Trebuchet & Catapult Aiming**: Manual counterweight calibration (200kg to 1200kg) and winch angle elevation (15° to 65°) calculating parabolic ballistic trajectories, triggering thunderous fiery boulder explosions and ground craters.
  - **392. Scaling Ladder Placement**: Raising and securing wooden assault ladders against rampart battlements under fire.
  - **393. Battering Ram Coordination**: Synchronized timing rhythm mini-mechanic against portcullises, shattering gate integrity.
  - **394. Boiling Oil Defense**: Pouring cauldrons of searing pitch down castle hatches, creating ground fire hazard zones (-85 HP/s DoT).
  - **395. Arrow Slit Archery Cover**: Utilizing narrow arrow loops for 100% directional missile protection while sniping outward.
  - **396. Caltrop Scatter & Foot Injury**: Scattering sharp four-pointed iron caltrops (Key `V`), crippling charging enemies with -60% movement speed penalties.
  - **397. Palisade & Wooden Spike Defenses**: Erecting defensive timber chevaux-de-frise barriers that deflect enemy charges.
  - **398. Siege Tower Docking**: Pushing multi-story wheeled siege towers to fortress walls and dropping heavy drawbridges.
  - **399. Fire Arrow Imbues**: Wrapping pitch cloth around arrows and lighting them at bonfires for incendiary siege strikes.
  - **400. Horn Blow Morale Buffs**: Sounding the sacred War Horn of Lordran (Key `H`), granting +45% defense and +60% stamina regen for 30s.

- **Heraldry, Social Hierarchy & Nobility (401–410)**:
  - **401. Tabard & Coat of Arms Customization**: Interactive Canvas Blazon studio with field tinctures (Gules, Azure, Sable, Vert, Purpure, Or, Argent), divisions (Pale, Fess, Chevron, Saltire, Quartered), and charges (Lion, Sun, Dragon, Swords, Crown, Raven, Tower) rendered directly onto the 3D player shield in real-time.
  - **402. Noble Title Social Standing**: Feudal hierarchy progression (Peasant Retainer, Squire, Knight Bachelor, Baronet, Count, Grand Paladin) unlocking merchant discounts (up to 35%) and guard deference.
  - **403. Peasant Deference & Bowing**: Non-hostile NPCs and hollows bow respectfully and doff caps when passing the knight.
  - **404. Aristocratic Banquet Etiquette**: Court banquet etiquette and diplomatic toasts gaining chivalric honor.
  - **405. Duel of Honor Mechanics**: Formal 1v1 chivalric challenges against elite champions (Sir Roland, Baron Vilem) settling personal disputes.
  - **406. Vassal Land Management**: Collecting passive soul taxes from managed fiefdoms (Skalitz Outpost, Burg Bastion, Parish Valley).
  - **407. Ransom & Prisoner Logistics**: Negotiating coin and soul ransoms for captured enemy warlords.
  - **408. Heraldic Recognition Penalty**: Infamy system tracking crimes committed while wearing faction arms.
  - **409. Royal Court Audience Protocols**: Kneeling protocols and formal sovereign honorifics.
  - **410. Knightly Order Initiation**: Overnight bonfire vigil, chivalric vows, and accolade dubbing ceremonies.

- **Medical, Herbalism & Apothecary Crafting (411–420)**:
  - **411. Leechcraft & Bloodletting**: Applying black medicinal leeches to drain infected blood and purge toxic poisons.
  - **412. Bone Setting Minigame**: Aligning fractured limb bones and applying splints to restore full sprint and roll locomotion.
  - **413. Herb Drying Racks**: Safehouse drying racks dehydrating wild flora (Marigold, Bloodflower, Poppy, Thistle) for long-term potency.
  - **414. Mortar & Pestle Grinding Physics**: Interactive rotational pestle grinding physics crushing dried herbs into refined powders.
  - **415. Alembic Heat Control**: Charcoal bellows regulation keeping alembic boiling point in the gold distillation band (78°C – 84°C).
  - **416. Opioid Poppy Extraction**: Brewing refined poppy tears into pain-numbing tinctures that eliminate stamina exhaustion for 25s.
  - **417. Antidote Synthesis**: Combining charcoal, sulfur, and thistle root into universal venom antidotes.
  - **418. Bandage Sterilization**: Boiling linen rags in water to prevent post-injury sepsis and wound rotting.
  - **419. Botanical Encyclopedia Journal**: Illustrated botanical codex with plant properties, Latin binomials, and brewing lore.
  - **420. Poisonous Spore Extraction**: Harvesting subterranean crypt fungi spores to craft blade confusion toxins.

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
