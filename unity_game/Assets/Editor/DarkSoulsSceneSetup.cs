#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace DarkSouls.Editor
{
    public static class DarkSoulsSceneSetup
    {
        [MenuItem("DarkSouls/Create MainWorld Scene")]
        public static void CreateMainWorldScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            var root = new GameObject("DarkSouls_BootstrapRoot");
            root.AddComponent<UnitySceneBootstrapper>();

            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, "Assets/Scenes/MainWorld.unity");
            Debug.Log("[DarkSoulsSceneSetup] Created Assets/Scenes/MainWorld.unity successfully.");
        }
    }
}
#endif
