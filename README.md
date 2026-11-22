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
- **O**: **Warp to Outside Realm Wilderness** (West Courtyard Gatehouse)
- **M**: Open High-Precision Developer Radar Map & Compass
- **F3**: Toggle Real-time Coordinates & FPS Diagnostic HUD
- **G**: Open Gesture Wheel (Praise the Sun, Bow, Point, Toast, etc.)
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

### 🌲 Outside Realm Apex Bosses & 228 Legendary Boss Roster
Traverse beyond the West Courtyard Gatehouse into the expansive Outside wilderness to challenge 228 legendary bosses across all Soulsborne eras:
- **Maliketh, The Black Blade (Маликейт Черный Клинок)** — Abyssal Eclipse Chasm
  - Wolf-beast anatomy in golden dragon plate, wielding the colossal Destined Death Greatsword radiating crimson-black vortex waves.
- **Dragonlord Placidusax (Владыка Драконов Плацидусакс)** — Scorched Dragonbarrow
  - Titanic dual-headed ancient archdragon with golden scales, red lightning claws, and golden ruin breath.
- **Lichdragon Fortissax (Дракон-лич Фортиссакс)** — Forbidden Mistwood Ruins
  - Deathblight-corrupted 4-winged wyrm hurling dual red lightning spears and breathing death mist.
- **Rennala, Queen of the Full Moon (Реннала Полнолунная)** — Carian Star Observatory
  - Astrologer royal robes, towering conical moon headdress, spinning Carian Regal Scepter, and hovering luminous Full Moon sphere.
- **Borealis, The Freezing Fog (Бореалис Леденящий Туман)** — Frozen Wyrmpeak Precipice
  - Translucent azure permafrost dragon with crystalline icicle stalagmites and howling blizzard breath.
- **Promised Consort Radahn (Обещанный Консорт Радан)** — Stormveil Cliffside Ramparts
  - Gilded lion armor, Young Miquella clinging to his shoulders with cascading braided hair, twin Greatswords of Light, and divine solar pillar.
- **Malenia, Goddess of Rot (Маления, Богиня Гнили)** — Caelid Rot Miasma Swamp
  - Unalloyed gold winged helmet, flowing crimson hair, Hand of Malenia prosthetic curved katana, and 4 blossoming Scarlet Aeonia butterfly wings dripping toxic rot pollen.
- **Fire Giant of the Mountaintops (Огненный Великан Вершин)** — Mountaintops Flame Peak Cauldron
  - Colossal stone-muscled titan with braided crimson beard, cyclopean Fell God chest eye, and massive circular iron avalanche dish.
- **Astel, Naturalborn of the Void (Астель, Рожденный Бездной)** — Nokstella Eternal Moon Terrace
  - Cosmic skull cranium with solitary purple stellar eye, serrated gravity mandibles, translucent constellation dragonfly wings, and segmented gravity stinger tail.
- **Bayle the Dread (Бейл Грозный)** — Farum Azula Crumbling Tempest
  - Battle-ravaged magma dragon skull with broken jagged horns, scarred chest with magma veins, severed wing bone stumps, and pierced ancient dragon harpoons.
- **Godfrey, First Elden Lord (Годфри, Первый Повелитель Элдена)** — Leyndell Erdtree Colosseum
  - Regal barbarian armor in burnished gold, flowing white mane and crown, massive double-bitted Great Axe of Godfrey, and ethereal phantom lion Beast Regent Serosh clutched across back.
- **Ludwig the Holy Blade (Людвиг Священный Клинок)** — Cathedral of the Deep Drowned Necropolis
  - Monstrous chimeric equine-human beast with weeping arcane eye bulbs, ragged hunter bandages, and the legendary glowing emerald Moonlight Greatsword.
- **Plus Ancient Dragon Senessax, Death Rite Bird, Fallingstar Beast, Starscourge Radahn, Messmer the Impaler, Rellana, Midra, and 220+ more!**

---

## 🌲 The Outside Realm Wilderness & Expeditions
Step through the western rampart archway or press `[ O ]` to enter the expansive outdoor terrain spanning over 200 meters of continuous collision geometry:
1. **Astral Meteor Crater**: Deep gravitational depression studded with glowing starlight crystal monoliths and cyan pointlight beacons.
2. **Magma Chasm Falls**: Cascading molten cataracts with dynamic ember lighting and scorch hazard zones.
3. **Titan Bone Cemetery**: Cyclopean skeletal ribcages forming natural gothic archways across the ashen dunes.
4. **Rotten Grove Sanctum**: Toxic fungal mounds veiled in spore clouds and primordial tree roots.
5. **Sunken Dragon Crypt**: Ancient sub-surface subterranean vault housing fossilized dragonkin.
6. **Ancient Dolmen Colonnade**: Megalithic stone rings marking ancient astronomical leylines.
7. **Caelid Rot Miasma Swamp**: Deep scarlet rot morass with towering Aeonian mushroom trees, weeping Haligtree roots, and bubbling toxic spore bogs.
8. **Mountaintops Flame Peak Cauldron**: Elevated basalt caldera (+8.0m) bound by colossal giant iron chains and stoked by primordial Fell God embers.
9. **Nokstella Eternal Moon Terrace**: Sunken nocturnal lapis terrace (-3.0m) crowned by a hovering Silver Moon core with orbital rings and obsidian obelisks.
10. **Farum Azula Crumbling Tempest**: Floating sky temple island (+7.0m) suspended amidst vortex clouds, red lightning conductors, and dragon god mausoleum altar.
11. **Leyndell Erdtree Colosseum**: Elevated golden marble amphitheater (+5.0m) flanked by Corinthian colonnades, royal lion sculptures, and radiant Erdtree bough archway.
12. **Cathedral of the Deep Drowned Necropolis**: Flooded sunken cemetery (-2.5m) with leaning gothic spires bound in rusted chains, colossal grave steles, and turquoise ghostfire braziers.
13. **Primeval Waystone Portals & Waypoints**: Instantaneous traversal back to Courtyard, Boss Arenas, or the Citadel.

---

## 🕷️ Procedural 3D Mob Models & Bestiary (1,062 Models / 690 Lore Entries)
Encounter newly crafted, fully rigged Three.js procedural 3D creatures with custom locomotion, attack animations, and hitboxes:
- **Lesser Red Wolf of Radagon / Dire Shadow Wolf**: Sleek night-shadow pelt, pointed lupine ears, glowing cyan lunar eyes, articulated quadruped paws, and an ethereal blue magic sword gripped crosswise in its jaws!
- **Abyssal Pus of Man / Corrupted Serpent Beast**: Grotesque gaping abyssal serpent exploding from a hollow host body, 5 glowing crimson eyes, and a colossal mutated talon arm.
- **Black Knife Assassin / Shadow Stalker**: Translucent stealth shroud, blank porcelain oval mask, cowled hood, and signature reverse-grip Black Knife dagger with crimson Destined Death flame!
- **Ancestral Horned Shaman**: Muscular primeval titan with massive 8-pointed branching stag antlers (1.8m span), spirit soul staff, and glowing soul lantern.
- **Scarlet Cleanrot Knight of Miquella**: Slender articulated winged brass cuirass, crescent-winged helmet with flowing veil, wielding thrusting Cleanrot rapier and winged scythe.
- **Fire Monk Prelate of the Forge**: Colossal bulbous red-iron hammered armor, grinning furnace mask with glowing flame eye slits, chimney collar, and giant Prelate's Inferno Crozier hammer.
- **Nox Swordstress of the Eternal City**: Layered shimmering white silk robes, mirrored conical silver headdress, and fluid segmented liquid silver whip-sword.
- **Farum Azula Draconic Beastman**: Muscular hunchbacked lupine-draconic predator with stone dorsal scales, beast fangs, and chipped ancient stone Azula cleaver.
- **Leyndell Royal Perfumer**: Gold-trimmed leather apothecary vestments, brass beak respirator mask, atomizer spray phial with explosive golden sparks, and slender rapier.
- **Abyssal Grave Warden**: Titanic executioner brute wrapped in mummy bandages and barbed iron wire, dual-wielding colossal carved granite gravestones with engraved cross motifs.
- **Glintstone Sorcery Marionette**: 4-armed clockwork brass automaton with avian bird-mask helmet, turning gears, dual curved scythes, and glintstone core!
- **Magma Wyrm Hatchling**: Heavy quadruped reptilian basalt chassis with glowing molten lava channels, 3 smoking volcanic spine vents, and lava-dripping maw.
- **Dragonkin Wyrm**: Swept-back magma horns, glowing internal chest vent with pointlight, spiked tail, and molten curved greatsword.
- **Crucible Knight Sentinel**: Red-gold Ordovis armor plate, antlered helm, golden feathered wings, runic greatsword, and spiked hornshield.
- **Abductor Virgin**: Heavy iron maiden cylindrical chassis with glowing internal furnace, rotating chariot wheels, and twin pendular executioner scythes.
- **Cthulhu Mindflayer**: Deep starry cosmic robes, cephalopod head with 6 writhing tentacles, starlight casting staff, and resonant summoning bell.
- **Omen Ogre**: Bulky horned titan, barbed iron neck collar, and heavyweight butcher cleaver.
- **Arachnid Scuttler**: 6 articulated segmented legs, chittering mandibles, glowing multi-eye cluster, and arced toxic stinger tail.
- Explore the **3D Compendium Viewer** (1,050 interactive models: 340 Armors, 330 NPCs, 380 Mobs) and the **Lore Codex** (690 documented beasts).

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
