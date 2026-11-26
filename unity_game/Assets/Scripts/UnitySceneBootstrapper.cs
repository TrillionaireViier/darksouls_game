using System;
using UnityEngine;
using UnityEngine.UI;

namespace DarkSouls
{
    /// <summary>
    /// Zero-Setup Runtime Bootstrapper (Build V75 - Unity 5x Expansion).
    /// Automatically builds the 3D Knight Player, Camera, Lighting, Bonfire, WorldChunkStreamer,
    /// Arsenal/Magic, Covenants, Outside Mob Spawner, and Full HUD when pressing Play in Unity.
    /// </summary>
    public class UnitySceneBootstrapper : MonoBehaviour
    {
        private bool showWarpMenu = false;
        private int selectedBossTier = 0;
        private Vector2 bossScroll = Vector2.zero;
        private DarkSoulsGameManager gm;
        private WorldChunkStreamer streamer;
        private ArsenalAndMagicSystem arsenal;
        private CovenantSystem covenants;
        private DarkSoulsPlayer player;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void AutoBootstrap()
        {
            if (FindFirstObjectByType<DarkSoulsGameManager>() != null) return;

            var root = new GameObject("DarkSouls_BootstrapRoot");
            DontDestroyOnLoad(root);
            root.AddComponent<UnitySceneBootstrapper>().InitializeWorld();
        }

        public void InitializeWorld()
        {
            SetupAtmosphere();
            streamer = new GameObject("WorldChunkStreamer").AddComponent<WorldChunkStreamer>();
            covenants = new GameObject("CovenantSystem").AddComponent<CovenantSystem>();
            arsenal = new GameObject("ArsenalAndMagicSystem").AddComponent<ArsenalAndMagicSystem>();

            player = Create3DKnightPlayer();
            streamer.playerTransform = player.transform;

            var bonfire = CreateBonfire(new Vector3(0f, 0f, 5f));
            var hud = CreateRuntimeHUD();
            WirePlayerEvents(player, hud);

            var gmGo = new GameObject("DarkSoulsGameManager");
            gm = gmGo.AddComponent<DarkSoulsGameManager>();
            gm.player = player;
            gm.bonfire = bonfire;
            gm.hud = hud;
            gm.worldStreamer = streamer;
            gm.covenantSystem = covenants;
            gm.arsenalSystem = arsenal;

            new GameObject("OutsideMobSpawner").AddComponent<OutsideMobSpawner>();
        }

        private void SetupAtmosphere()
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.28f, 0.26f, 0.32f);
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogColor = new Color(0.08f, 0.08f, 0.11f);
            RenderSettings.fogDensity = 0.0085f;

            if (FindFirstObjectByType<Light>() == null)
            {
                var sunGo = new GameObject("Directional_AshenLight");
                var light = sunGo.AddComponent<Light>();
                light.type = LightType.Directional;
                light.color = new Color(0.95f, 0.85f, 0.72f);
                light.intensity = 1.25f;
                sunGo.transform.rotation = Quaternion.Euler(42f, -35f, 0f);
            }
        }

        private DarkSoulsPlayer Create3DKnightPlayer()
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var steelMat = new Material(shader) { color = new Color(0.55f, 0.57f, 0.62f) };
            var clothMat = new Material(shader) { color = new Color(0.22f, 0.14f, 0.14f) };
            var goldMat = new Material(shader) { color = new Color(0.82f, 0.68f, 0.25f) };

            var playerGo = new GameObject("Player_AshenKnight");
            playerGo.transform.position = new Vector3(0f, 1.2f, 0f);
            var cc = playerGo.AddComponent<CharacterController>();
            cc.center = new Vector3(0f, 1f, 0f);
            cc.radius = 0.45f;
            cc.height = 2.0f;

            // Torso
            var torso = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            torso.transform.SetParent(playerGo.transform, false);
            torso.transform.localPosition = new Vector3(0f, 1.0f, 0f);
            torso.transform.localScale = new Vector3(0.65f, 0.75f, 0.48f);
            torso.GetComponent<Renderer>().sharedMaterial = steelMat;
            Destroy(torso.GetComponent<Collider>());

            // Helmet
            var helm = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            helm.transform.SetParent(playerGo.transform, false);
            helm.transform.localPosition = new Vector3(0f, 1.85f, 0f);
            helm.transform.localScale = new Vector3(0.42f, 0.46f, 0.44f);
            helm.GetComponent<Renderer>().sharedMaterial = steelMat;
            Destroy(helm.GetComponent<Collider>());

            // Sword
            var sword = GameObject.CreatePrimitive(PrimitiveType.Cube);
            sword.transform.SetParent(playerGo.transform, false);
            sword.transform.localPosition = new Vector3(0.48f, 1.05f, 0.42f);
            sword.transform.localRotation = Quaternion.Euler(35f, 0f, -10f);
            sword.transform.localScale = new Vector3(0.08f, 1.25f, 0.06f);
            sword.GetComponent<Renderer>().sharedMaterial = goldMat;
            Destroy(sword.GetComponent<Collider>());

            // Shield
            var shield = GameObject.CreatePrimitive(PrimitiveType.Cube);
            shield.transform.SetParent(playerGo.transform, false);
            shield.transform.localPosition = new Vector3(-0.48f, 1.05f, 0.28f);
            shield.transform.localScale = new Vector3(0.08f, 0.85f, 0.58f);
            shield.GetComponent<Renderer>().sharedMaterial = clothMat;
            Destroy(shield.GetComponent<Collider>());

            // Camera Pivot & Main Camera
            var camPivot = new GameObject("CameraPivot");
            camPivot.transform.SetParent(playerGo.transform, false);
            camPivot.transform.localPosition = new Vector3(0f, 1.6f, 0f);

            var mainCam = Camera.main;
            if (mainCam == null)
            {
                var camGo = new GameObject("Main Camera");
                camGo.tag = "MainCamera";
                mainCam = camGo.AddComponent<Camera>();
                camGo.AddComponent<AudioListener>();
            }
            mainCam.transform.SetParent(camPivot.transform, false);
            mainCam.transform.localPosition = new Vector3(0f, 1.3f, -5.2f);
            mainCam.transform.localRotation = Quaternion.Euler(12f, 0f, 0f);
            mainCam.farClipPlane = 2000f;

            var p = playerGo.AddComponent<DarkSoulsPlayer>();
            p.cameraPivot = camPivot.transform;
            p.shieldMesh = shield;
            return p;
        }

        private Bonfire CreateBonfire(Vector3 pos)
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var go = new GameObject("FirelinkBonfire");
            go.transform.position = pos;

            var baseMound = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            baseMound.transform.SetParent(go.transform, false);
            baseMound.transform.localPosition = new Vector3(0f, 0.15f, 0f);
            baseMound.transform.localScale = new Vector3(1.5f, 0.15f, 1.5f);
            baseMound.GetComponent<Renderer>().sharedMaterial = new Material(shader) { color = new Color(0.25f, 0.20f, 0.18f) };

            var coiledSword = GameObject.CreatePrimitive(PrimitiveType.Cube);
            coiledSword.transform.SetParent(go.transform, false);
            coiledSword.transform.localPosition = new Vector3(0f, 0.8f, 0f);
            coiledSword.transform.localRotation = Quaternion.Euler(0f, 0f, 8f);
            coiledSword.transform.localScale = new Vector3(0.08f, 1.4f, 0.08f);
            coiledSword.GetComponent<Renderer>().sharedMaterial = new Material(shader) { color = new Color(0.8f, 0.55f, 0.25f) };

            var light = go.AddComponent<Light>();
            light.type = LightType.Point;
            light.color = new Color(1.0f, 0.52f, 0.15f);
            light.range = 16f;
            light.intensity = 2.8f;

            var col = go.AddComponent<SphereCollider>();
            col.isTrigger = true;
            col.radius = 3.5f;

            var bf = go.AddComponent<Bonfire>();
            bf.bonfireLight = light;
            return bf;
        }

        private DarkSoulsHUD CreateRuntimeHUD()
        {
            var canvasGo = new GameObject("DarkSouls_HUD_Canvas");
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGo.AddComponent<CanvasScaler>();
            canvasGo.AddComponent<GraphicRaycaster>();

            var hud = canvasGo.AddComponent<DarkSoulsHUD>();
            Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            // Health Bar
            hud.healthBarFill = CreateBar(canvasGo.transform, new Vector2(24, -24), new Vector2(320, 22), new Color(0.75f, 0.12f, 0.14f), out hud.healthText, font);
            // Stamina Bar
            hud.staminaBarFill = CreateBar(canvasGo.transform, new Vector2(24, -52), new Vector2(260, 16), new Color(0.16f, 0.68f, 0.28f), out _, font);

            // Estus & Souls
            hud.estusText = CreateLabel(canvasGo.transform, new Vector2(24, -78), new Vector2(180, 28), "ESTUS x 5", font, 16, TextAnchor.MiddleLeft);
            hud.soulsText = CreateLabel(canvasGo.transform, new Vector2(24, -104), new Vector2(180, 28), "SOULS: 0", font, 16, TextAnchor.MiddleLeft);

            // Notification Banner
            hud.notificationText = CreateLabel(canvasGo.transform, new Vector2(0, 120), new Vector2(700, 40), "", font, 20, TextAnchor.MiddleCenter);
            hud.notificationText.rectTransform.anchorMin = new Vector2(0.5f, 0.5f);
            hud.notificationText.rectTransform.anchorMax = new Vector2(0.5f, 0.5f);
            hud.notificationText.color = new Color(1f, 0.85f, 0.45f);
            hud.notificationText.gameObject.SetActive(false);

            // Boss Container
            var bossGo = new GameObject("BossContainer");
            bossGo.transform.SetParent(canvasGo.transform, false);
            var bossRect = bossGo.AddComponent<RectTransform>();
            bossRect.anchorMin = new Vector2(0.5f, 0f);
            bossRect.anchorMax = new Vector2(0.5f, 0f);
            bossRect.anchoredPosition = new Vector2(0f, 65f);
            bossRect.sizeDelta = new Vector2(640f, 44f);
            hud.bossContainer = bossGo;

            hud.bossNameText = CreateLabel(bossGo.transform, new Vector2(0, 24), new Vector2(640, 24), "BOSS", font, 16, TextAnchor.MiddleCenter);
            hud.bossBarFill = CreateBar(bossGo.transform, new Vector2(-320, 0), new Vector2(640, 16), new Color(0.78f, 0.14f, 0.14f), out _, font);
            bossGo.SetActive(false);

            return hud;
        }

        private Image CreateBar(Transform parent, Vector2 pos, Vector2 size, Color color, out Text label, Font font)
        {
            var bg = new GameObject("BarBG").AddComponent<Image>();
            bg.transform.SetParent(parent, false);
            bg.color = new Color(0.08f, 0.08f, 0.08f, 0.85f);
            var rt = bg.rectTransform;
            rt.anchorMin = new Vector2(0f, 1f);
            rt.anchorMax = new Vector2(0f, 1f);
            rt.pivot = new Vector2(0f, 1f);
            rt.anchoredPosition = pos;
            rt.sizeDelta = size;

            var fill = new GameObject("BarFill").AddComponent<Image>();
            fill.transform.SetParent(bg.transform, false);
            fill.color = color;
            fill.type = Image.Type.Filled;
            fill.fillMethod = Image.FillMethod.Horizontal;
            var frt = fill.rectTransform;
            frt.anchorMin = Vector2.zero;
            frt.anchorMax = Vector2.one;
            frt.offsetMin = new Vector2(2, 2);
            frt.offsetMax = new Vector2(-2, -2);

            label = CreateLabel(bg.transform, Vector2.zero, size, "", font, 13, TextAnchor.MiddleCenter);
            label.rectTransform.anchorMin = Vector2.zero;
            label.rectTransform.anchorMax = Vector2.one;
            label.rectTransform.offsetMin = Vector2.zero;
            label.rectTransform.offsetMax = Vector2.zero;
            return fill;
        }

        private Text CreateLabel(Transform parent, Vector2 pos, Vector2 size, string text, Font font, int fontSize, TextAnchor anchor)
        {
            var go = new GameObject("Label");
            go.transform.SetParent(parent, false);
            var t = go.AddComponent<Text>();
            t.font = font;
            t.text = text;
            t.fontSize = fontSize;
            t.alignment = anchor;
            t.color = Color.white;
            var rt = t.rectTransform;
            rt.anchorMin = new Vector2(0f, 1f);
            rt.anchorMax = new Vector2(0f, 1f);
            rt.pivot = new Vector2(0f, 1f);
            rt.anchoredPosition = pos;
            rt.sizeDelta = size;
            return t;
        }

        private void WirePlayerEvents(DarkSoulsPlayer p, DarkSoulsHUD hud)
        {
            p.OnHealthChanged += hud.UpdateHealth;
            p.OnStaminaChanged += hud.UpdateStamina;
            p.OnEstusChanged += hud.UpdateEstus;
            p.OnSoulsChanged += hud.UpdateSouls;
            p.OnNotification += hud.ShowNotification;
            p.OnPlayerDied += hud.ShowDeathScreen;
        }

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.C) && covenants != null)
            {
                covenants.CycleNextCovenant();
                if (gm != null && gm.hud != null)
                    gm.hud.ShowNotification($"COVENANT: {covenants.ActiveCovenant} (RANK {covenants.CovenantRank})");
            }

            if (Input.GetKeyDown(KeyCode.M))
            {
                showWarpMenu = !showWarpMenu;
                Cursor.lockState = showWarpMenu ? CursorLockMode.None : CursorLockMode.Locked;
                Cursor.visible = showWarpMenu;
            }
        }

        private void OnGUI()
        {
            // Top-Right Real-Time World & Arsenal Telemetry
            float w = 440f;
            GUI.Box(new Rect(Screen.width - w - 16, 16, w, 160), "DARK SOULS UNITY 125X EXPANSION (BUILD V77)");
            string locName = streamer != null ? streamer.CurrentNearestLocation.name : "Firelink Citadel";
            string zoneName = streamer != null ? streamer.CurrentNearestLocation.zone : "Firelink Citadel";
            int totalLocs = streamer != null ? streamer.TotalLocationsCount : 0;
            string covName = covenants != null ? $"{covenants.ActiveCovenant} / {covenants.ActiveOrder}" : "None";
            string wepName = arsenal != null ? $"{arsenal.ActiveWeapon.name} [{arsenal.CurrentWeaponIndex + 1}/{arsenal.Weapons.Count}]" : "Astora Straight Sword";
            string splName = arsenal != null ? $"{arsenal.ActiveSpell.name} [{arsenal.CurrentSpellIndex + 1}/{arsenal.Spells.Count}]" : "Soul Arrow";
            string rngName = arsenal != null ? $"{arsenal.ActiveRing.name} [{arsenal.CurrentRingIndex + 1}/{arsenal.Rings.Count}]" : "Ring of Favor";

            GUI.Label(new Rect(Screen.width - w - 4, 40, w - 20, 22), $"Zone: {zoneName} ({totalLocs:N0} Locations)");
            GUI.Label(new Rect(Screen.width - w - 4, 60, w - 20, 22), $"Sector: {locName}");
            GUI.Label(new Rect(Screen.width - w - 4, 80, w - 20, 22), $"Weapon [Tab]: {wepName}");
            GUI.Label(new Rect(Screen.width - w - 4, 100, w - 20, 22), $"Spell [R/F]: {splName}");
            GUI.Label(new Rect(Screen.width - w - 4, 120, w - 20, 22), $"Ring [T]: {rngName}");
            GUI.Label(new Rect(Screen.width - w - 4, 142, w - 20, 22), $"Cov [C]: {covName} | [M] 625 Bosses & 625 Sectors");

            if (showWarpMenu && gm != null)
            {
                var allBosses = (BossType[])Enum.GetValues(typeof(BossType));
                Rect win = new Rect(Screen.width * 0.5f - 300, Screen.height * 0.5f - 250, 600, 500);
                GUI.Box(win, $"625 BOSS ENCOUNTERS & 28.26M LOCATIONS WARP [M to Close]");

                string[] tierNames = { "T1 Base", "T2 Abyssal", "T3 Cinderlord", "T4 Outer God", "T5 Primeval" };
                for (int t = 0; t < 5; t++)
                {
                    if (GUI.Button(new Rect(win.x + 14 + t * 115, win.y + 28, 110, 24), (selectedBossTier == t ? "> " : "") + tierNames[t]))
                    {
                        selectedBossTier = t;
                    }
                }

                bossScroll = GUI.BeginScrollView(new Rect(win.x + 12, win.y + 58, win.width - 24, win.height - 70), bossScroll, new Rect(0, 0, 550, allBosses.Length * 34 + 10));
                int y = 0;
                foreach (BossType bt in allBosses)
                {
                    if (GUI.Button(new Rect(0, y, 265, 28), $"Boss #{(int)bt + 1} ({tierNames[selectedBossTier]}): {bt}"))
                    {
                        gm.SpawnBoss(bt, selectedBossTier);
                        showWarpMenu = false;
                        Cursor.lockState = CursorLockMode.Locked;
                        Cursor.visible = false;
                    }
                    if (streamer != null && GUI.Button(new Rect(275, y, 265, 28), $"Warp Ring #{((int)bt + 1) * (selectedBossTier + 1)}"))
                    {
                        var loc = streamer.GetSampleLocation(((int)bt + selectedBossTier * 125) * 45217);
                        gm.WarpPlayerToLocation(loc);
                        showWarpMenu = false;
                        Cursor.lockState = CursorLockMode.Locked;
                        Cursor.visible = false;
                    }
                    y += 34;
                }
                GUI.EndScrollView();
            }
        }
    }
}
