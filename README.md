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

### 🌲 Outside Realm Apex Bosses & 265 Legendary Boss Roster
Traverse beyond the West Courtyard Gatehouse into the expansive Outside wilderness to challenge 257 legendary bosses across all Soulsborne eras:
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

## 🌲 Outside Realm Expeditions & Apex Lords (553 Fast-Travel Locations & 77 Outside Zones)

The outside world beyond the Royal Citadel gates spans over 1,500 meters of primeval terrain, ancient archtree forests, volcanic calderas, and abyssal ruins, featuring 61 bespoke Outside locations, 60 active mob patrols, and 14 apex Soulsborne lords:

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
