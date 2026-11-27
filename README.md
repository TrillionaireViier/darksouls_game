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

### 🌲 Outside Realm Apex Bosses & 337 Legendary Boss Roster
Traverse beyond the West Courtyard Gatehouse into the expansive Outside wilderness to challenge 281 legendary bosses across all Soulsborne eras:
- **Maliketh, The Black Blade (Маликейт Черный Клинок)** — Abyssal Eclipse Chasm
  - Wolf-beast anatomy in golden dragon plate, wielding the colossal Destined Death Greatsword radiating crimson-black vortex waves.
- **Dragonlord Placidusax (Владыка Драконов Плацидусакс)** — Scorched Dragonbarrow
  - Titanic dual-headed ancient archdragon with golden scales, red lightning claws, and golden ruin breath.
- **Malenia, Goddess of Rot (Маления, Богиня Гнили)** — Haligtree Roots of Rotting Aeonia
  - Unalloyed gold prosthesis, winged valkyrie helm, 4.2m Hand of Malenia katana, glowing scarlet rot butterfly wings, and Waterfowl Dance.
- **Promised Consort Radahn & Miquella (Обещанный Консорт Радан и Микелла)** — Enir-Ilim Divine Gate Staircase
  - 3.8m tall champion in ornate lion plate armor, twin meteoric greatswords with golden light edges, and Miquella radiating holy light pillars.
- **Sir Alonne, Sword Saint (Сэр Алонн, Святой Меча)** — Iron Keep Polished Obsidian Altar
  - Jet-black lacquered samurai armor, golden crescent kabuto maedate, wielding the 3.8m Bewitched Alonne Katana with crimson bloodflame edge.
- **The Burnt Ivory King (Сгоревший Король Слоновой Кости)** — Old Chaos Throne of the Ivory King
  - Scorched ivory plate etched with molten magma veins, 7-spire crown, and the colossal 4.2m Ivory King Ultra Greatsword radiating crystal flame.
- **Slave Knight Gael, End of Time (Рыцарь-раб Гаэль)** — Dune of Filianore & Gael's Ashen Waste
  - Hunched colossal veteran in billowing red executioner cape, chipped Executioner Greatsword, and arm-mounted repeating arbalest.
- **Darkeater Midir, Abyssal Archdragon (Мидир Пожиратель Тьмы)** — Ringed City Abyssal Midir Chasm
  - 5m primordial archdragon in obsidian scales, 4 colossal stone wings, glowing abyssal purple eyes, humanity crystal clusters, and humanity breath.
- **Ludwig, The Holy Blade (Людвиг Священный Клинок)** — Nightmare Corpse-River Cavern
  - Grotesque chimera beast-knight wielding the 4.0m Holy Moonlight Greatsword radiating ethereal cyan starlight runes and arcane mist.
- **Lady Maria of the Astral Clocktower (Леди Мария из Астральной Часовой Башни)** — Astral Clocktower Celestial Balcony
  - Regal hunter frock coat, silver-trimmed tricorn hat, dual-wielding Rakuyo twin sabers trailing sanguine blood ribbons and flame arcs.
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
- **Mohg, Lord of Blood (Мог Повелитель Крови)** — Mohgwyn Blood Mausoleum & Dynastic Altar
  - Asymmetrical omen ram horns piercing eye socket, dark velvet robe with golden dynastic filigree, obsidian bat wings dripping bloodflame, and the 4.8m Sacred Spear of Mohgwyn (Trident of the Formless Mother) with pulsating crimson bloodboon eruption aura.
- **Godskin Duo: Apostle & Noble (Апостол и Дворянин Божественной Кожи)** — Dragonbarrow Black Flame Sanctum
  - Dual encounter featuring the tall, slender Godskin Apostle wielding the spiral Godskin Peeler twinblade and the armored Godskin Noble with stitched leather hood and heavy thrusting rapier, engulfed in swirling black-and-white Godskin pyres.
- **Fume Knight Raime (Рейм Дымный Рыцарь)** — Brume Tower Ashen Smelter Furnace
  - Towering knight in scorched ash-black iron plate armor, smoldering ember fractures leaking from gauntlets and helm, dual-wielding the colossal 4.2m slab Fume Ultra Greatsword with molten core and the scorched ashen straight sword.
- **Commander Niall of Castle Sol (Командир Найлл)** — Castle Sol Eclipse Ramparts & Cathedral
  - Heavy silver veteran plate mail with white frost wolf fur collar, horned commander crest, left leg replaced by a bladed prosthetic peg leg crackling with yellow storm lightning, and the 4.6m Veteran's Standard halberd with billowing eclipse solar banner.
- **Royal Knight Loretta (Королевский Рыцарь Лоретта)** — Carian Royal Moongazing Spire
  - Mounted Carian champion atop an armored war steed draped in navy blue silk caparison, wielding the crescent Loretta's War Sickle polearm in right hand and ethereal glowing blue Greatbow of Loretta mounted on back with brilliant glintstone cyan aura.
- **Sinh, the Slumbering Dragon (Син Дремлющий Дракон)** — Abyssal Sunken City of Shulva
  - Colossal 5m pale-teal ancient dragon, quadruped posture, giant ancient dragon spear impaled through its sternum with broken shafts, tattered ribbed wings, and toxic emerald miasma breath.
- **Prince of Death Godwyn Avatar (Аватар Принца Смерти Годвин)** — Deeproot Depths Sunken Godwyn Catacomb
  - Oceanic fish-tailed death titan abomination crowned with cascading golden royal tresses, weeping black deathroot tears, multiple branching thorny deathroot branches reaching upwards, and deep turquoise ghostfire soul core.
- **Dragonlord Placidusax (Владыка Драконов Плацидусакс)** — Timeless Eye Storm Sanctuary
  - Titanic 6m ancient dragon lord with two remaining long serpentine golden-scaled necks ending in horned draconic heads, severed third and fourth neck stumps dripping golden dragon blood, massive curled tail, golden dragon wings, and red lightning claw talons.
- **Plus Ancient Dragon Senessax, Death Rite Bird, Fallingstar Beast, Starscourge Radahn, Messmer the Impaler, Rellana, Midra, and 233+ more!**

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
13. **Mohgwyn Blood Mausoleum & Dynastic Altar**: Sunken dynastic plaza (-6.0m) of blood-red marble framed by four obsidian obelisks where bloodflame pools bubble with sacred corruption.
14. **Dragonbarrow Black Flame Sanctum**: Elevated basalt terrace (+8.0m) accessed by a grand ramp, 6 flared obsidian hex pillars, and roaring cauldrons of black-and-white Godskin flame.
15. **Timeless Eye Storm Sanctuary**: Soaring tempest sky dais (+14.0m) suspended amidst 8 floating golden gravestones, red lightning attractor spires, and the ancient dragon lord's throne.
16. **Deeproot Depths Sunken Godwyn Catacomb**: Subterranean cavern (-8.0m) dominated by the colossal carved stone visage of Godwyn the Golden, arching petrified deathroot, and turquoise ghostfire.
17. **Abyssal Sunken City of Shulva**: Ancient stepped ziggurat pyramid city (-5.0m) submerged in emerald poison pools and guarded by verdigris bronze dragon totems.
18. **Brume Tower Ashen Smelter Furnace**: Suspended iron smelting platform (+10.0m) held by colossal 2.5m thick iron anchor chains over boiling lava vats and cursed ash idols.
19. **Castle Sol Eclipse Ramparts & Cathedral**: Windswept frost-covered stone battlements (+6.0m) flying solar eclipse standards in howling snow flurries.
20. **Carian Royal Moongazing Spire**: Lofty moongazing terrace (+12.0m) crowned by a hovering Silver Full Moon core with orbital celestial rings and glintstone crystal formations.
21. **Primeval Waystone Portals & Waypoints**: Instantaneous traversal back to Courtyard, Boss Arenas, or the Citadel.

---

## 🕷️ Procedural 3D Mob Models & Bestiary (1,078 Models / 690 Lore Entries)
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
- **Sanguine Noble Duelist**: Hooded cowl with golden filigree, crimson noble velvet tabard, thrusting Bloody Helice rapier with spiraling needle tip, left-hand bloodflame parrying stiletto, and ruby eye glow!
- **Blackflame Monk Pyromancer**: Flared black iron furnace cowl, layered charcoal habit, heavy spiked flame mace, and swirling black-and-white flame orb hovering above hand.
- **Deeproot Mausoleum Knight**: Headless spectral steel plate armor, deathbird feather mantle, Spectral Eclipse Greatshield with carved eclipse sun & bone inlay, and winged halberd with turquoise ghostflame sheen.
- **Ashen Iron Warrior**: Heavy bulbous basalt chest with glowing orange magma fractures, smoking chimney vents on shoulders, and colossal forged square iron greathammer with volcanic heat distortion.
- **Banished Knight of the Eclipse**: Majestic dragon-wing crest on helmet, flowing red hair plumage, full gothic articulated plate mail, and Banished Knight's Greatsword with cold frost rune engravings.
- **Carian Knight Preceptor**: Gilded midnight-blue polished plate cuirass, royal navy mantle, Carian Knight's Straight Sword with glowing azure Glintblade phalanx floating overhead.
- **Sanctum Knight Automaton**: Ancient Mesoamerican/Babylonian engraved verdigris bronze armor, glowing turquoise venom eye slits, and heavy morningstar spiked mace dripping green poison spheres.
- **Living Mercurial Mimic Tear**: Sleek humanoid liquid-metal mercury anatomy, high specular mirror chrome finish (roughness 0.05, metalness 0.98), right arm morphing into a gleaming curved liquid silver scythe-blade.
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


---

## 🌲 Outside Realm Expeditions & Apex Lords (625 Fast-Travel Locations & 149 Outside Zones)

The outside world beyond the Royal Citadel gates spans over 3,250 meters of primeval terrain, ancient archtree forests, volcanic calderas, and abyssal ruins, featuring 133 bespoke Outside locations, 132 active mob patrols, and 94 apex Soulsborne lords:

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V81 Expansion)
1. **New Londo Darkwraith Knight (Skull Helmet, Dark Sword & Red Dark Hand)**: Skull-faced dark plate knight wielding a jagged Dark Sword and ethereal crimson vortex Dark Hand shield.
2. **Blighttown Blowdart Hollow (Bandaged Mutant & Poison Blowpipe)**: Bandaged hunched mutant stalking toxic rafters, firing venomous poison darts from a bamboo blowpipe.
3. **Yharnam Cloaked Beast Patient (Tattered Cowl & Beast Claws)**: Shaggy beast under tattered cowl, wielding a blazing torch and slashing with venomous beast talons.
4. **Moonside Hard-Head Spider Broodling (Crystalline Skull Carapace)**: Small armored arachnid with a deflection stone-hard skull carapace and cluster of glowing blue cosmic eyes.
5. **Cathedral Knight of the Garden (Towering Blued Steel & Greatsword)**: Towering blued steel knight in cylindrical bucket helm, swinging a 2.8m Greatsword and holy cross tower shield.
6. **Alonne Knight Captain of the Forge (Horned Kabuto & Flame Katana)**: Blackened iron armor with horned kabuto crest and crimson neckguard, lunging with a flame-engulfed katana.
7. **Yharnam Snatcher Kidnapper (Tall Lanky Predator & Bloody Sack)**: Lanky pale-faced predator robed in tattered black, carrying a bloody burlap sack and entering lethal frenzy rage.
8. **Divine Horned Warrior of Enir-Ilim (Ram Horns & Dual Storm Cleavers)**: Beast-horned warrior in flowing golden silk trousers, performing relentless spinning storm cleaver flurries.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V81 Expansion)
1. **Four Kings, Shadow Sovereigns of the Abyss (New Londo Ruins & The Abyss Void Well)**: 4 levitating shadow kings floating in formation with spired diadems, 4.4m dark soul greatswords and purple void grabs (-32.0m elevation).
2. **Chaos Witch Quelaag, Daughter of Chaos (Blighttown Depths & Magma Web Caldera)**: Colossal glowing molten spider abdomen with boiling lava vents mounted by a pale flame sorceress wielding Quelaag's Furysword (-24.0m elevation).
3. **Blood-starved Beast of Old Yharnam (Old Yharnam & Church of the Good Chalice)**: Emaciated flayed beast with trailing back-skin ribbons, exposed spine, caustic poison blood, and front scythe claws (+16.0m elevation).
4. **Rom, the Vacuous Spider of the Moonside Lake (Moonside Lake & Reflective Glass Expanse)**: Massive segmented pale caterpillar arachnid with stone boulder skull, clustered cosmic eyes, and cosmic meteor volleys (+2.0m elevation).
5. **Oceiros, the Consumed King (Consumed King's Garden & Toxic Fog Basin)**: Grotesque eyeless dragon scale humanoid mutant cradling an invisible infant, wielding a 4.5m crystal catalyst staff (-18.0m elevation).
6. **Old Iron King of the Molten Lava Lake (Iron Keep Lower Foundry & Molten Brimstone Caldera)**: Colossal bull-horned demon colossus emerging waist-deep from molten magma, with lava-cracked chest and sweeping flame fists (-28.0m elevation).
7. **Darkbeast Paarl of the Graveyard (Yahar'gul Graveyard & Hypogean Electric Basin)**: Skeletal quadruped beast draped in crackling cyan lightning discharges, sweeping spidery claw strikes and shockwaves (-12.0m elevation).
8. **Needle Knight Leda, Cleansing Sword of Miquella (Enir-Ilim Cleansing Terrace & Golden Needle Altar)**: Chased silver-gilt armor with white feathered mantle, wielding Leda's Piercing Sword and floating golden needle projectiles (+44.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V80 Expansion)
1. **Dark Chasm Havel Phantom (Carved Solid Rock Armor & Dragon Tooth)**: Carved solid stone armor and helm, swinging a massive 2.4m Dragon Tooth club and arched stone tower shield steeped in abyss.
2. **Desert Pyromancer Sorceress (Crimson Silk Vestments & Flame Palm)**: Crimson silk vestments with gold bangles and sheer veil, casting swirling combustion fireballs from her palm and fanning sparks.
3. **Yharnam Scourge Werewolf (Lanky Lupine Beast & Long Claws)**: Hunched lanky lycanthrope with matted black-grey fur, razor lupine fangs, elongated talons, and glowing red predator eyes.
4. **Carthus Skeleton Assassin (Bleached Ribcage & Dual Curved Shotels)**: Bleached ivory ribcage and articulated skeletal agility, crimson desert headwrap, wielding dual curving Carthus Shotels.
5. **Depths Butcher Executioner (Burlap Sack Mask & Dual Meat Cleavers)**: Hulking muscular butcher with stained burlap hood and blood-caked leather apron, dual-wielding massive notched meat cleavers.
6. **Amana Shrine Water Priestess (Azure Silk Robe & Water Soul Staff)**: Azure and aquamarine silk vestments with white coral veil, channeling homing water soul spears from her glowing coral staff.
7. **Lothric Royal Winged Knight (Bulbous Brass Armor & Angel Wings)**: Bulbous domed golden brass plate armor with twin feathered angel wings on back, swinging a 2.5m heavy royal halberd.
8. **Forbidden Woods Snake Host (Victorian Coat & Writhing Snake Cluster)**: Tattered Victorian huntsman trenchcoat with a writhing cluster of venomous green vipers bursting from the chest, wielding a rusty axe.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V80 Expansion)
1. **Darklurker, Angel of the Dark Chasm (Dark Chasm of Old & Pilgrims' Altar)**: Levitating 4-winged fallen angel with purple void cowl, dual ethereal soul greatswords, dark soul orb volleys, and split duplication (-18.0m elevation).
2. **Mytha, the Baneful Queen (Earthen Peak & Windmill Poison Basin)**: 8m serpent-bodied lamia with golden corset, holding her severed singing head aloft while thrusting a 4.8m toxic golden trident spear (+14.0m elevation).
3. **Cleric Beast of the Great Bridge (Great Bridge of Central Yharnam)**: Massive screeching white-furred beast titan with colossal mutated left claw arm, ragged ribcage, stag antlers, and crushing jump slams (+28.0m elevation).
4. **High Lord Wolnir, Skeleton Sovereign of the Abyss (Catacombs Abyssal Hall)**: Colossal skeleton sovereign rising from dark abyss with jeweled golden crown, 3 radiant glowing gold bangles, and Holy Grave Greatsword (-26.0m elevation).
5. **Gaping Dragon of the Sunken Depths (Sunken Depths & Flooded Sewer Maw)**: Monstrous mutated dragon whose entire chest and belly splits open into a vertical maw lined with 20 razor rib teeth, 6 wings, and acid spew (-22.0m elevation).
6. **Demon of Song, Amphibious Lurker (Shrine of Amana & Flooded Lotus Haven)**: Armored amphibious stone frog shell that parts open to expose a pale grotesque human face with sunken eyes, 4.2m arms, and singing cries (+4.0m elevation).
7. **Vordt of the Boreal Valley (High Wall of Lothric & Boreal Outrider Gate)**: Hunched quadruped outrider knight in frost fluted plate armor with spiked crown, glowing ice eyes, subzero breath cone, and Great Hammer (+32.0m elevation).
8. **Shadow of Yharnam, Wraiths of the Woods (Forbidden Grave & Shadow Snake Basin)**: Faceless Nazgûl wraith robed in billowing tattered black cowl, wielding a 4.2m flaming curved scimitar, smoking candle brazier, and serpents (-10.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V79 Expansion)
1. **Fire Monk Prelate Executioner (Bulbous Scarlet Silk & Prelate Hammer)**: Bulbous scarlet silk robe with gold embroidery, oversized polished brass kettle cauldron helm, swinging a 2.8m Prelate's Inferno Hammer and flame whip.
2. **Hornsent Inquisitor Priest (Golden Spiral Horns & Multi-Barbed Staff)**: Tangled spiral golden horns crown, ceremonial prayer tunic with parchment strips, brandishing a multi-barbed golden inquisitor staff and sickle ring blades.
3. **Syan Royal Mirror Squire (Embossed Gold Armor & Mirror Tower Shield)**: Ornate gold-embossed plate armor with high blue plume helm, mirror tower shield reflecting starlight, and crackling lightning halberd.
4. **Dreg Heap Chaos Fire Harpy (Obsidian Skin & Magma Wings)**: Obsidian skin demon humanoid with broad tattered leathery wings lined in orange magma embers, razor talons, and a glowing chaos chest.
5. **Messmer Fire Knight (Winged Dragon Sallet & Spiral Flame Needle)**: Tall slender silver plate armor with winged dragon sallet helm and crimson silk tabard, wielding a slender spiral flame needle rapier.
6. **Nightmare Winter Lantern (Multi-Eyed Brain Mass & Victorian Gown)**: Fragile Victorian lace gown supporting an enormous grotesque multi-lobed brain head studded with 14 glowing yellow frenzy eyes.
7. **Profaned Gargoyle Herald (Carved Granite Wings & Molten Flame Spear)**: Carved granite stone gargoyle with muscular stone torso, ram horns, angular wings, brandishing a 2.9m stone flame spear with glowing molten veins.
8. **Lothric Castle Elite Greatlance Knight (Royal Blue Cape & Jousting Greatlance)**: High-crested steel plate knight with flowing royal blue cape and winged helm, wielding a monumental 3.8m jousting Greatlance and tower shield.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V79 Expansion)
1. **Fire Giant, Titan of the Fell God (Fell Caldera & Forge of the Giants)**: Colossal red-bearded titan with chest Fell God eye, bone-bound leg, swinging an iron cauldron disc shield and flame eruptions (+32.0m elevation).
2. **Divine Beast Dancing Lion, Stormherald of Belurat (Belurat Tower & Storm Dancing Stage)**: Ceremonial two-performer Hornsent lion with golden spiral horn mask, cycling between tempest wind, frost shards, and golden thunder (+12.0m elevation).
3. **Looking Glass Knight, Sentinel of the Passage (King's Passage & Storm Mirror Dais)**: Gothic silver plate titan with weeping mask, summoning phantoms from his reflective mirror shield and calling lightning (-16.0m elevation).
4. **Demon Prince, Last Lord of Chaos (The Dreg Heap & Sunken Kiln Basin)**: Last lord of chaos with obsidian magma ribcage, 5.4m wingspan bat wings, and a floating blazing chaos meteor orb (-28.0m elevation).
5. **Commander Gaius & Great Armored Tusk Boar (Scaduview Gravity Ridge & Boar Gate)**: Dark-steel plated Albinauric general riding an armored tusked war boar, charging with a 5.2m purple gravity lance (+20.0m elevation).
6. **Moon Presence, Flora of the Blood Moon (Nightmare Bloom & Red Moon Lake)**: Eldritch flora god of the blood moon with facial tentacles, exposed ribcage, paleblood heart, and blinding red gaze (+6.0m elevation).
7. **Yhorm the Giant, Lord of the Profaned Flame (Profaned Capital & Burning Throne Dais)**: Ash-grey giant king with glowing ember visor slit, iron armor, swinging a 5.8m jagged Great Machete engulfed in Profaned Flame (-20.0m elevation).
8. **Dragonslayer Armour, Possessed Iron Bastion (Lothric High Bridge & Bastion Mooring)**: Possessed dragon scale iron armor with twin-horned dragon greatshield, 4.8m lightning greataxe, and pilgrim butterflies (+26.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V76 Expansion)
1. **Skeleton Wheel & Bone Necromancer Executioner (Spiked Wheel Shield & Scythe)**: Spiked iron wheel shield mounted on left arm with 8 pointed spikes, hollow ribcage with glowing crimson eye sockets, curved bone scythe and necromancy flame skull lantern.
2. **Boreal Outrider Knight (Animalistic Silver Plate & Frost Rapier)**: Sleek silver animalistic plate armor with frost crest, glowing cyan visor slit, frost rapier and boreal greatsword with trailing ice particles.
3. **Fingercreeper Colossus (Multi-Jointed Crawling Hand & Arcane Gem Ring)**: Giant crawling hand beast with 10 articulated jointed fingers, jagged claws, and glowing purple ring jewel on the palm.
4. **Putrescent Slime Mass & Bloodfiend Cleaver (Rotting Gelatin & Fissure Cleaver)**: Rotting cyan-ectoplasm slime ghoul draped in decaying gelatin, brandishing an oversized rusty fissure cleaver with cyan putrescent ghostflame light.
5. **Nightjar Tengu Shinobi (Raven Beak Mask, Feather Wing Cloak & Dual Kama)**: Agile shinobi acrobat in dark raven-beaked Tengu mask with feathered wing cloak, wielding dual curved steel Kama sickles.
6. **Golden Order Envoy Longhorn Oracle (Silk Robe, Turban & Golden Longhorn)**: Ceremonial white silk robe and spherical turban headdress, holding a monumental golden bubble longhorn trumpet blowing homing golden spheres.
7. **Church Nightmare Executioner (Crimson Vestments, Bell Helm & Heavy Greataxe)**: Hulking nightmare church executioner in heavy crimson robes, conical brass bell helm, swinging a 3.2m Executioner's Greataxe.
8. **Alonne Ironclad Turtle Knight (Turtle Shell Carapace & Spiked Warhammer)**: Heavy black-iron turtle carapace shell and spiked helm, swinging a massive 2.6m Cast-Iron Warhammer with ground shockwaves.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V76 Expansion)
1. **Gravelord Nito, First of the Dead (Tomb of the Giants & Nito's Ossuary)**: Colossal avatar of thousands of animated skeletons cloaked in death miasma, wielding the jagged 5.2m Gravelord Greatsword and unleashing toxic red miasma waves (-18.0m elevation).
2. **Dancer of the Boreal Valley (Boreal Valley & Dancer's Grand High Plaza)**: Slender sinuous dancer in silver-blue filigree gown and veil, dual-wielding curved Fire and Dark Magic blades in endless pirouettes (+15.0m elevation).
3. **Metyr, Mother of Fingers (Finger Ruins of Dheo & Microcosm Crater)**: Cosmic eldritch entity of intertwined fingers crowned with a radiant purple Microcosm Pearl, firing starlight beams and tail whips (-10.0m elevation).
4. **Putrescent Knight & Ghost Steed (Stone Coffin Fissure & Putrescent Deep Garden)**: Skeletal knight fused atop a rotting ghost steed dripping cyan ghostflame, throwing the 4.6m Boomerang Putrescence Cleaver (-24.0m elevation).
5. **Guardian Ape & Headless Primordial Beast (Bodhisattva Valley & Primordial Waterhole)**: Colossal white ape titan with a 5.4m rusty nodachi sword lodged in neck, leaping into belly-flops, poison roars, and headless terror shrieks (+8.0m elevation).
6. **Elden Beast, Cosmic Vessel of Greater Will (Cosmic Golden Sea & Greater Will Dais)**: Translucent starlit nebula serpent-whale with golden galaxy ribs, wielding the 6.2m Sacred Relic Greatsword and Elden Stars rain (+24.0m elevation).
7. **Laurence, the First Vicar (Nightmare Grand Cathedral & Blazing Altar)**: Gargantuan horned cleric beast engulfed in raging flames, trailing pools of crawling molten lava from its mutated left claw (+18.0m elevation).
8. **Smelter Demon, Blazing Colossus of Iron Keep (Iron Keep Smelting Core & Magma Kiln)**: Bull-horned black iron colossus with hollow blazing chest furnace, immolation heat pulses, and the 5.0m flaming Smelter Sword (-14.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V74 Expansion)
1. **Black Knight Cinder Executioner (Charred Plate & Flaming Greatsword)**: Charred obsidian fluted armor radiating molten orange embers between plates, wielding a 3.4m Black Knight Greatsword with flaming overhead cleaves and a heavy iron kite shield.
2. **Oolacile Bloathead Sorcerer (Bulbous Head & Abyss Dark Bead Catalyst)**: Deformed bloated head studded with glowing purple eye blisters, wielding a gnarled Oolacile wood catalyst firing shotgun bursts of primeval Dark Beads and homing dark souls.
3. **Crystal Golem Prism Crusher (Faceted Cyan Crystal Spires & Fists)**: Monolithic translucent cyan crystalline golem with pointed shoulder spires and an inner prism chest core, pounding the ground with crystal shockwaves.
4. **Grave Warden Kukri Assassin (Hooded Cowl & Dual Serrated Twinblades)**: Agile assassin wrapped in crimson-stained bandages and ragged skirts, executing spinning acrobatic bleed flurries with dual curved Warden Twinblades.
5. **Undead Crypt Syan Knight (Gilded Royal Plate, Blue Cape & Syan Halberd)**: Regal royal knight in shining gold armor and flowing azure cape, wielding a long Syan Halberd and tower heater shield with disciplined thrust combinations.
6. **Clocktower Enlarged Head Patient (Swollen Bandaged Head & Metal IV Pole)**: Erratic asylum patient with an enormous swollen head wrapped in gauze bandages, aggressively swinging a heavy steel IV pole stand weapon and glass medicine bottles.
7. **Calamity Dragon Acolyte (Black Dragon Scale Mail & Calamity Sickle)**: Dragon-cult warrior draped in obsidian dragon scales and horned bone headdress, harvesting foes with a curved obsidian dragon sickle and orange calamity embers.
8. **Crucible Knight Siluria (Tree Crown Helm, Holy Wings & Spiraling Tree Spear)**: Primordial red-gold plate champion with spiraling tree branch headdress, golden feathered wings, and the drill-pointed Siluria's Tree spear.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V74 Expansion)
1. **Lord Gwyn, Ascended God of Sunlight & First Lord of Cinder (Kiln of the First Flame)**: Revered patriarch of Lordran crowned in radiating golden sunlight rays with flowing white beard, brandishing the 4.2m Greatsword of Blazing Sunlight and hurling golden Sunlight Spears (+30.0m elevation).
2. **Manus, Ascended Father of the Primeval Abyss (Chasm of the Abyss)**: Gargantuan abyssal beast with a colossal 4.5m mutated razor-clawed arm, black abyss fur, 14 glowing red eyes, and a Primeval Catalyst casting catastrophic Dark Bead waves and Humanity rain (-22.0m elevation).
3. **Seath the Scaleless, Blind Dragon of Primordial Moonlight (Crystal Cave)**: Monumental albino wyrm with six fluttering crystalline angel wings, smooth scale-less skin, four tentacle tails, and sweeping Moonlight Crystal breath geysers (+14.0m elevation).
4. **Champion Gundyr, The Unbroken Vanguard (Untended Graves)**: Untended Graves gladiator in scarred dark iron plate with glowing red eyes, executing ferocious charge tackles, spinning halberd combos, and acrobatic dropkicks (-12.0m elevation).
5. **Velstadt, The Royal Aegis & Dark Chime Sentinel (Undead Crypt)**: Towering champion in fluted bronze-gold bell armor and midnight velvet cape, wielding the 4.5m Sacred Chime Greathammer ringing resonant dark chime waves and hex blasts (-16.0m elevation).
6. **Lady Maria of the Astral Clocktower (Astral Clocktower)**: Elegant Victorian hunter matriarch dual-wielding the split Rakuyo sabre and dagger, slashing with soaring arcs of incandescent bloodflame before a colossal astronomical clock dial (+20.0m elevation).
7. **Black Dragon Kalameet, Bringer of Calamity (Oolacile Calamity Crater)**: Prehistoric four-legged obsidian dragon with massive bat wings and glowing orange Calamity Eye on forehead, unleashing telekinetic gravity levitation and black calamity flame (+26.0m elevation).
8. **Lichdragon Fortissax, Deathblight Lightning Sovereign (Deeproot Depths)**: Four-winged ancient dragon scarred by Deathblight golden decay, dual-wielding two crackling 5.8m Red Lightning Spears crashing down with sonic thunder (-8.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V73 Expansion)
1. **Lothric Winged Knight (Angelic Halberd & Golden Feather Wings)**: Bulky knight in golden rounded plate armor with magnificent arching feathered wings on the back, wielding a dual-bladed angelic halberd to perform spinning whirlwind attacks.
2. **Ariamis Corvian Crow Demon (Razor Talons & Raven Wings)**: Hunched corvian fiend with razor steel talons, sharp curved beak mask, and tattered jet-black feathered wings diving from snowy parapets.
3. **Ashina Nightjar Ninja Scout (Tengu Mask & Shuriken Wheel)**: Agile crouched shinobi wearing a tengu straw mask and raven mantle, hurling massive spinning shuriken blade wheels and dropping firecrackers.
4. **Redmane Flame Chariot (Iron Beast Face & Furnace Mouth)**: Heavy cast-iron juggernaut chariot with spiked crushing wheels and an open furnace mouth roaring with blazing flame torrents.
5. **Central Yharnam Huntsman Mob (Top Hat, Pitchfork & Torch)**: Crazed Victorian townsman in top hat and tattered overcoat, aggressively thrusting a three-pronged pitchfork and swinging a blazing pitch torch.
6. **Silver Knight Dragonslayer Greatbow Archer (Polished Plate & Greatbow)**: Regal knight in shining silver plate armor drawing a colossal Dragonslayer Greatbow that fires thunderbolt harpoons with massive poise damage.
7. **Ruin Sentinel Automaton (Brass Plate & Poleaxe Halberd)**: Slender bronze-brass automaton knight with cylindrical slit helm, executing acrobatic poleaxe spins and circular buckler strikes.
8. **Stormveil Blade Warhawk (Talon Scythes & Gunpowder Keg)**: Predatory storm hawk with razor steel curved scythes strapped to its talons and an explosive red gunpowder keg on its chest.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V73 Expansion)
1. **Twin Princes: Lorian & Lothric (Lothric Castle Throne Room)**: Crippled elder prince Lorian wielding the scorched Greatsword of Lorian with holy light teleportation, while younger prince Lothric clings to his back firing homing soul spears atop the royal dais (+24.0m elevation).
2. **Crossbreed Priscilla & Blizzard of Ariamis (Painted World Snowy Sanctuary)**: Towering white-robed dragon maiden wielding the frost-gleaming Lifehunt Scythe, disappearing into blizzard mist leaving snow footprints (+16.0m elevation).
3. **Genichiro Ashina, Way of Tomoe (Ashina Castle Upper Dojo)**: Stripped-down samurai warlord channeling the crimson Mortal Blade, rapid Floating Passage sword flurries, and leaping Lightning of Tomoe thunderbolts (+28.0m elevation).
4. **General Radahn, Conqueror of the Stars (Caelid Wailing Dunes)**: Colossal golden-armored champion wielding twin Starscourge Greatswords, riding faithful steed Leonard, summoning gravitational meteors (-10.0m elevation).
5. **Father Gascoigne, The Beast Hunter (Oedon Tomb Graveyard)**: Victorian hunter in duster coat and broad-brimmed hat swinging the extended Hunter Axe and blunderbuss, transforming into a ferocious lycanthrope beast (-6.0m elevation).
6. **Dragonslayer Ornstein & Executioner Smough (Anor Londo Royal Cathedral)**: Legendary golden duo: swift Dragonslayer Ornstein darting with lightning spear lunges, and colossal Executioner Smough crushing with his gargantuan golden war hammer (+22.0m elevation).
7. **The Pursuer, Cursebearer of the Bastille (Lost Bastille Iron Rampart)**: Hovering phantom knight in dark corroded steel plate with crimson demonic eyes, levitating on ghostly mist and delivering impaling curse thrusts (+18.0m elevation).
8. **Godrick the Grafted & Lord of Stormveil (Stormveil Grafted Courtyard)**: Multi-armed golden lord wielding three tempest axes, grafting a decapitated dragon head onto his left arm to spew sweeping inferno waves (+12.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V69 Expansion)
1. **Fountainhead Okami Warrior (Lightning Kemari & Katana)**: Slender porcelain-masked warrior in blue silk kimono and flowing wisteria purple sash, volleying crackling lightning kemari balls and delivering swift silver katana slashes.
2. **Cainhurst Castle Gargoyle Bloodlicker (Flea Beast)**: Grotesque bloated crimson blood-sac aberration with spindly skeletal quadruped legs, tattered leathery bat wings, and a long razor proboscis needle.
3. **Carian Marionette Aviator (Quad-Arm Clockwork Puppet)**: Brass clockwork puppet body powered by a pulsing glintstone core, featuring 4 articulated arms wielding dual curved shortswords and twin rapid-fire shortbows.
4. **Deep Evangelist Preacher (Spiked Mace & Wimple Robes)**: Bulky white-wimpled clerical priestess in charcoal-grey robes, swinging a devastating two-handed spiked iron mace and casting dark gnawing Deep Soul hexes.
5. **Giant Royal Sentinel of Anor Londo (Brass Halberd & Tower Shield)**: Colossal 4-meter brass-armored guardian crowned in golden sun plumes, brandishing a massive gilded tower shield and ceremonial war halberd.
6. **Briar Duelist Gladiator (Barbed Battleaxe & Chain)**: Muscular bronze-tanned arena fighter wound in tight coils of rusted barbed briar wire, wielding a heavy barbed battleaxe connected to iron chains and spiked buckler.
7. **Senpou Taro Trooper (Giant Tree-Trunk War Mallet)**: Gigantic childlike monk brute in coarse hemp robes wearing sacred red prayer beads, swinging a mammoth tree-trunk war mallet with earth-shattering force.
8. **Silver Tear Mimic Slime (Formless Chrome Shifter)**: Undulating dome of liquid mercury chrome with metallic specular reflections, sprouting morphing silver spike pseudopods and a glowing celestial starlight core.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V69 Expansion)
1. **Divine Dragon of Fountainhead & Gracious Tears (Sacred Fountainhead Palace)**: Majestic celestial jade-white dragon floating amidst sacred vermilion Torii gates, wielding the legendary Seven-Branched Sword Nanatsusaya crackling with emerald storms and dragon lightning (+18.0m elevation).
2. **Lady Maria of the Astral Clocktower (Cainhurst Frozen Parapets)**: Noble hunter matriarch in tri-corner hat and midnight coat, dual-wielding the curved Rakuyo trick blades igniting scorching bloodflame waves and fiery crimson arcs (+14.0m elevation).
3. **Glintstone Dragon Adula of Manus Celes (Moonlight Altar Plateau)**: Majestic crystalline four-winged azure dragon crowned in jagged glintstone horns, channeling the colossal Carian Moonlight Greatsword in its jaws and breathing crystalline frost (+22.0m elevation).
4. **Aldrich, Devourer of Gods & Saint of the Deep (Cathedral Sunken Graveyard)**: Horrific undulating mass of abyssal sludge and dregs fused with the upper body of god Gwyndolin, unleashing moonlight arrow storms from the Darkmoon Longbow and reaping with the Lifehunt Scythe (-15.0m elevation).
5. **Dark Sun Gwyndolin & Shadows of Anor Londo (Anor Londo Dark Sun Tomb)**: Serpentine deity draped in golden silk skirts with lower body composed of writhing black serpents, crowned in a radiant sun-halo mask and firing homing moonlight arrows (+12.0m elevation).
6. **Elemer of the Briar & Bell Bearing Hunter (The Shaded Castle Poison Briar Moat)**: Rusted iron executioner bound in barbed thorns, telekinetically commanding the floating Marais Executioner's Sword to drill forward in red corkscrew corking thrusts (-8.0m elevation).
7. **Corrupted Monk, Illusion & True Naginata Guardian (Mt. Senpou Bell Demon Bamboo Sanctum)**: Towering smiling-masked priestess in flowing lavender monk robes, whirling a 5.2-meter silver Jumonji Naginata polearm in continuous 360-degree slashing combos (+20.0m elevation).
8. **Astel, Stars of Darkness & Naturalborn Abyss (Nokstella Stargazer Waterfall Basin)**: Cosmic dragonfly aberration crowned in miniature nebulae, featuring celestial wings, crushing gravity pincers, and a segmented tail swinging devastating meteorite explosions (-18.0m elevation).



### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V60 Expansion)
1. **Leyndell Perfumer Page (Repeating Crossbow & Spark Aromatic)**: Slender white silk tunic with gold embroidered collar, traveler's tricorn hood, repeating mechanical triple-shot crossbow with bronze crank, and perfume flask with floating golden spark aromatic mist.
2. **Senpou Temple Straw-Hat Assassin (Spinning Twin Naginata)**: Wide conical woven bamboo straw hat (jingasa) concealing glowing red assassin eyes, saffron monk robes with rope sash, agile crouching stance, and double-ended spinning naginata polearm.
3. **Clayman Priest of the Uhl Dynast (Bubble Catalyst Harpoon)**: Bulbous earthenware terracotta clay body with carved ancient dynastic spiral glyphs, terracotta skull with horizontal slit visor, harpoon spear with glowing azure bubble tip, and 3 orbiting iridescent starlight bubbles.
4. **Oolacile Bloathead Sorcerer (Dark Bead Hex Catalyst)**: Grotesque swollen globular bloathead covered in a cluster of 6 glowing red abyssal eyes, tattered indigo robes of ancient Oolacile, and twisted wooden catalyst branch staff topped with a crackling Dark Bead orb.
5. **Luminescent Celestial Emissary (Cosmic Stardust Dart)**: Translucent cyan-grey elongated humanoid body, swollen cerebral bulbous alien head with pulsating glowing veins, waving forehead tentacle antennae, and an orbiting halo of 4 miniature octahedron starlight crystals.
6. **Ashina Ashigaru Matchlock Rifleman & Halberdier**: Black-lacquered conical jingasa helmet with gold Ashina crest, red lacquered chest cuirass over grey kosode, heavy wooden matchlock rifle (tanegashima) with bronze barrel, and Ashina blue clan sashimono banner on back frame.
7. **Dragon Cult Lapis Knight (Dragonbolt Spear & Crest Shield)**: Deep lapis-blue fluted knight plate armor, winged dragon helmet with red plume, heavy Dragonbolt Spear crackling with red ancient dragon lightning, and teardrop lapis shield embossed with the four-winged dragon crest.
8. **Man-Serpent Magma Sorcerer (Molten Lava Flail & Staff)**: Coiled serpentine lower tail in golden-amber scales, slender hooded serpent torso with flared cobra hood, magma sorcery staff ending in a caged boiling lava sphere, and spiked molten iron flail.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V60 Expansion)
1. **Morgott, the Omen King & Margit the Fell Omen (Leyndell Erdtree Sanctuary)**: Majestic omen titan crowned in twisting horns, draped in tattered royal mantles, wielding the curved amber Cursed-Blood Greatsword and floating ethereal golden incantation daggers (+20.0m elevation).
2. **Lady Butterfly, Mist Illusionist of Mt. Senpou (Usui Misty Forest Hall of Illusions)**: Aged shinobi matriarch in dark plum silk kosode and gold sash, white topknot bun, dual razor-sharp kunai blades with glowing violet illusion wires, and orbiting sakura phantom butterflies (+10.0m elevation).
3. **Dragonkin Soldier of Nokstella, Frozen Lightning Behemoth (Ainsel River Basin)**: Titanic pale cyan draconic giant crawling on knuckles and knees, exposed skeletal dragon ribs, horned skull, and colossal pale-blue frost-lightning spear crackling with electric ice (-14.0m elevation).
4. **Knight Artorias the Abysswalker, Wolf Knight of Gwyn (Oolacile Ruined Colosseum)**: Weathered silver-blue fluted plate corroded by abyssal mire, pointed helm with trailing shredded blue plume, limp broken left arm, and 3.8m Greatsword of Artorias dripping black humanity sludge (+5.0m elevation).
5. **Ebrietas, Daughter of the Cosmos & Star Child (Upper Cathedral Altar of Despair)**: Pearlescent slug-mollusk lower body, vertically bifurcated head tube lined with weeping cosmic star eyes, quad fluttering celestial angel wings, and A Call Beyond starlight lasers (-16.0m elevation).
6. **Gyoubu Masataka Oniwa, Castle Gate General (Ashina Castle Gatefield)**: Mounted on armored heavy black warhorse Onikage, full black-lacquered samurai armor, kabuto helmet crowned with giant curved wooden demon horns, and 5-meter cross-spear (Jumonji Yari) (+8.0m elevation).
7. **Ancient Dragon Florissax & Dragon Priestess of Communion (Jagged Peak Dragon's Pit)**: Slender priestess draped in ancient shimmering crimson-gold scales, quad stone dragon horn crown, Flowerstone Gavel hammer crackling with red dragonbolt, and Heart of the Ancient Dragon (+16.0m elevation).
8. **Rykard, Lord of Blasphemy & God-Devouring Serpent (Volcano Manor Magma Lake)**: Colossal coiled red-black serpent with molten magma belly, grotesque human face of Lord Rykard embedded on the neck under golden crown, wielding the serrated Blasphemous Blade with writhing red arms (-12.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V57 Expansion)
1. **Beastman of Farum Azula (Dragonscale Cleaver)**: Hunchbacked draconic-lupine predator in slate-grey scales with dorsal spine plates, snarling beast jaws, glowing crimson eyes, and heavy chipped stone cleaver.
2. **Farron Ghru Elder & Leaper**: Gnarled woodland ghru body with mossy bark skin, quad branching horned skull headdress, and rotten poison-dripping tree staff with caustic green spore mist.
3. **Irithyll Pontiff Fire Witch**: Slender elongated silver-white silk robes, fluted silver gargoyle-horned headdress, and 2.7m gargoyle flame staff crowned with roaring orange-amber fire.
4. **Cathedral Ward Tall Church Servant**: Tall slender gothic black cassock, wide-brimmed church hat, heavy carved wooden executioner cross-staff, and hanging pale ghostfire lantern.
5. **Hirata Estate Shinobi Bandit Torchbearer**: Weathered straw rain cape, conical straw jingasa hat with black face wrap, curved bandit katana, and crackling wooden pitch torch.
6. **Raya Lucaria Glintstone Sorcerer**: Midnight-blue academy robes, Karolos twin-faced stone scholar crown with embedded azure glintstone crystal, and crystal staff.
7. **Ashina Interior Ministry Lone Shadow Ninja**: Sleek purple-black shinobi garb, cowled assassin hood, iron greaves for spinning poison heel kicks, and reverse-grip ninjato blade.
8. **Rauh Horned Divine Beast Warrior**: Verdigris bronze plate armor, spiraling divine beast horns on bronze mask, and dual curved divine wind claymores with teal storm vortex light.

### 👑 8 Brand-New Apex Outside Lords & Arenas (V57 Expansion)
1. **The Abyss Watchers, Bloodhounds of Farron (Farron Keep Mausoleum)**: Pointed steel helm with wolf crest, dark leather surcoat, 3.2m Wolf Knight Ultra Greatsword, reverse-grip flame dagger, and embered red abyss eyes (+8.0m elevation).
2. **Maliketh, the Black Blade & Gurranq (Farum Azula Dragon Temple Sanctum)**: Colossal lupine beast in gold-chased obsidian armor with silver mane, wielding the 4.8m Destined Death Black Blade crackling with crimson-black runes (+28.0m elevation).
3. **Pontiff Sulyvahn, Tyrant of the Boreal Valley (Irithyll Grand Cathedral)**: Liturgical papal mitre and gold silk robes, dark phantom wings, dual-wielding the Profaned Greatsword of Fire and Greatsword of Judgement (+18.0m elevation).
4. **Vicar Amelia, White Fur Beast of Prayer (Yharnam Cathedral High Altar)**: Colossal white lupine beast with elongated claw arms, mammoth stag antlers draped in white lace bandages, and radiant gold prayer bell (+12.0m elevation).
5. **Owl (Father), Great Shinobi of the Mists (Hirata Blazing Audience Chamber)**: Master shinobi warlord in feathered owl mantle with flowing grey topknot, colossal 3.8m nodachi, and spectral blue spirit owl perched on shoulder (+6.0m elevation).
6. **Rennala, Queen of the Full Moon (Raya Lucaria Grand Library)**: Indigo astral robes and crescent moon crown, holding the glowing golden Amber Egg, surrounded by an orbiting silver full moon sphere (+14.0m elevation).
7. **The Demon of Hatred, Karmic Fire Titan (Ashina Castle Gates in Flames)**: Titanic hunched fire beast with cracked magma hide, single curving bull horn, chest furnace, and sweeping 5-meter fire whip left arm (+4.0m elevation).
8. **Romina, Saint of the Bud & Scarlet Centipede (Ancient Ruins of Rauh Scarlet Rot Pavilion)**: Articulated 12-legged centipede lower body fused with slender saint in rotted robes, double-bladed Scarlet Rot Glaive, and pink rot butterfly halo (-6.0m elevation).

### 🌟 8 Brand-New Bespoke 3D Mob Archetypes (V55 Expansion)
1. **Corvian Rapier Knight Stalker**: Feathery raven wings on hunched avian body, crow beak plague mask with glowing crimson eyes, slender barbed rapier and crow-quill offhand dagger.
2. **Dragonkin Lightning Halberdier**: Slate-grey dragon scales, crested bronze dragon horned helm, curved tail, and twin-bladed lightning halberd with crackling yellow electric sparks.
3. **Ashina Red-Guard Arquebusier & Naginata Guard**: Vermilion-lacquered samurai armor, conical jingasa battle hat, dual-barrel matchlock gun with bayonet spear, and Ashina clan war banner.
4. **Church Doctor Grim Executioner**: High black gothic church frock coat, white porcelain mask, spiked wooden cross-staff with hanging lantern, and brass cruciform bell.
5. **Leyndell Sacred Tree Sentinel Patrol**: Heavy fluted gold plate armor with lion-head helm, massive golden tree-sentinel greatshield, and giant golden halberd with holy radiance.
6. **Badlands Blood-Rage Berserker**: Muscular bare torso with crimson war paint, horned beast skull headdress, and twin jagged blood cleavers with frenzy embers.
7. **Fire Knight Queelign Duelist**: Slender silver and scarlet armor draped in crimson silk sash, spiral pointed helm with visor slit, and flame-bladed greatsword with fire coils.
8. **Hornsent Inquisitor Greatsword Priest**: Curving ram-horn wooden mask, spiral gold prayer robes, and dual golden crescent sickles with fluttering holy paper talismans.

### 🌟 Previous Bespoke 3D Mob Archetypes (V47 Expansion)
1. **Dreadflame Dragon Harvester**: Magma rock scales, spiked dragon bone shoulder pads, barbed dragon harpoon spear with glowing magma tip, and obsidian dragon bone shield.
2. **Deep Sea Barnacle Fishman Priest**: Hunched amphibious aborigine with bioluminescent cyan dangling angler-lure stalk, dorsal fin crests, and weathered whalebone trident.
3. **Black Knight Greatsword Annihilator**: Midnight blackened iron plate armor with red magma fissures, flared horned crest helm, and colossal Zweihander ultra-greatsword.
4. **Archdragon Stone Disciple**: Ancient ascetic dragon warrior with hardened slate scales, four stone winglets on back, curling dragon horns, and dual petrified dragon tooth clubs.
5. **Kindred of Rot Pest**: Multilegged segmented centipede carapace with six articulated clawed arms, pest-thread spear lance with glowing golden filaments, and mandible pincers.
6. **Cainhurst Vileblood Royal Guard**: Polished mirror-silver fluted plate armor with crimson velvet cape, high gothic standing collar, slender rapier, and parrying main gauche dagger.
7. **Okami Divine Palace Noble**: Serpentine floating aristocrat in royal violet and white silk kimono robes, carved wooden noh mask, and ornate curved naginata with water mist ribbons.
8. **Serpent Guard Lightning Manserpent**: Muscular emerald-scaled serpent brute with spreading flared cobra hood, yellow serpentine slitted eyes, and bronze curved scimitar with lightning spark core.

### 🌟 Previous Bespoke 3D Mob Archetypes (V41 Expansion)
1. **Cleanrot Valkyrie Knight**: Slender golden-vermilion plate armor with winged helmet crest, flowing scarlet cape, slender Cleanrot rapier and golden winged scythe.
2. **Divine Beast Dancing Lion Disciple**: Ornate horned storm beast mask with swirling mane, festive silk robes, and dual lightning cleaver daggers.
3. **Alonne Shadow Samurai**: Pitch-black lacquered kabuto with gold crescent maedate, sode shoulder armor, flowing dark sash, and long curved nodachi katana.
4. **Charred Loyce Knight**: Burnt ivory full plate armor with glowing orange magma fissures, high crested helm, blazing flame spear, and kite shield.
5. **Ringed Knight Executioner**: Black ashen plate with gaping hollow Dark Sign in chest radiating fiery embers, and paired barbed Ringed Greatswords.
6. **Abyssal Dragon Apostle**: Obsidian draconic scales, curved dragon horns, articulated dragon tail, dragon seal, and red lightning spark staff.
7. **Blood Cleric Hunter**: Charcoal leather longcoat with flowing skirts, tricorn hunter hat, face cowl, heavy silver Kirkhammer, and blood lantern.
8. **Clockwork Automaton Maiden**: Fine porcelain face, articulated brass clockwork joints, revolving brass gear halo, and dual celestial chakram blades.

### 🌟 Previous Bespoke 3D Mob Archetypes
1. **Crucible Horned Sentinel**: Imposing primordial warrior in red-gold iridescent armor with spiraling bull horns, sprouting golden-red feathered wings, colossal Crucible Tree Spear, and tower shield.
2. **Bloodhound Knight**: Feral low-slung predator with chased burnished steel plate, wolf-snout closed helm, glowing amber eye slits, and reverse-grip Bloodhound's Fang curved greatsword.
3. **Frenzied Flame Acolyte**: Saffron-robed nomad monk whose head is consumed by a roaring, incandescent Frenzied Sun orb, carrying a scorched resonant fiddle staff with yellow embers.
4. **Crystalian Blademaiden**: Translucent faceted sapphire/teal crystalline body with an inner cyan refractive core, pointed crystal shard crown, and orbiting floating crystal chakram hoop blades.
5. **Farum Azula Draconic Beastman**: Hulking wolf-dragon hybrid warrior with thick stone scales, horned dragon skull, and a colossal notched basalt cleaver crackling with crimson dragon lightning.
6. **Onyx Meteor Lord**: Slender obsidian celestial titan with purple gravitational glowing veins, floating meteorite shoulder pauldrons, an orbiting crown of meteor shards, and a colossal curved Alabaster Greatsword.

### 👑 Bespoke 3D Apex Boss Models & Arenas
- **Bayle the Dread (Jagged Peak Caldera)**: Scarred magma dragon tyrant with broken wing stumps, jagged basalt horns, and scarlet lightning breath (+4.0m elevation).
- **Messmer the Impaler (Shadow Keep Ramparts)**: Slender gothic lord in crimson plate with coiled abyssal serpents, golden dragon eye, and the blazing Crimson Impaler Spear (+4.0m elevation).
- **Midra, Lord of Frenzied Flame (Frenzied Flame Abyss)**: Sunken marble catacomb where Midra's head burns as a golden celestial sun, brandishing the Barbed Greatsword of Damnation (-4.0m elevation).
- **Malenia, Goddess of Rot (Haligtree Sacred Roots)**: Unalloyed golden winged helm, prosthetics, Hand of Malenia katana, and blossoming Scarlet Aeonia butterfly wings (+2.0m elevation).
- **The Nameless King (Archdragon Thunder Belfry)**: Skyward mountain belfry towering above stormclouds, ringing a monumental bronze bell with Dragonslayer Swordspear (+7.0m elevation).
- **Death Rite Bird (Ancient Dolmen Colonnade)**: Skeletal avian god with tattered black pinions, cyan ghostflame eyes, and Death's Poker ghostflame lance.
- **Full-Grown Fallingstar Beast (Astral Meteor Crater)**: Cosmic bull carapace with cyclopean purple gravity eye, curved mandibles, and segmented scorpion tail.
- **Putrid Erdtree Avatar (Rotten Mother Grove)**: Headless hollow wood titan crowned in golden boughs, scarlet rot fungi, and golden ritual staff.
- **Sanctuary Stone Titan (Western Precipice)**: Ancient carved granite golem with mossy shoulders, glowing emerald rune chest core, and monolithic club.
- **Ancient Dragon Lansseax (Wyrm Ridge Altar)**: Four-winged prehistoric stone dragon priestess clutching a crackling 5-meter Red Lightning Glaive.


Developed by VIIER Agency • TrillionaireViier • Dark Souls Project © 2026
