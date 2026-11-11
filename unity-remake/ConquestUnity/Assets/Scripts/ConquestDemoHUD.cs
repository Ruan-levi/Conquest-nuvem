using UnityEngine;

namespace Conquest.UnityRemake
{
    public sealed class ConquestDemoHUD : MonoBehaviour
    {
        private float frameTime;
        private int preset = 2;

        private void Update()
        {
            frameTime = Mathf.Lerp(frameTime, Mathf.Max(Time.unscaledDeltaTime, 0.001f), .08f);
            if (Input.GetKeyDown(KeyCode.F1)) ApplyPreset(0);
            if (Input.GetKeyDown(KeyCode.F2)) ApplyPreset(1);
            if (Input.GetKeyDown(KeyCode.F3)) ApplyPreset(2);
        }

        private void ApplyPreset(int quality)
        {
            preset = quality;
            // Controles leves e seguros; resolucao/render scale ficam no URP Asset.
            QualitySettings.shadowDistance = quality == 0 ? 35f : quality == 1 ? 70f : 110f;
            QualitySettings.vSyncCount = 1;
            Application.targetFrameRate = 60;
            RenderSettings.fogDensity = quality == 0 ? .008f : .006f;
        }

        private void OnGUI()
        {
            GUI.Box(new Rect(18, 16, 440, 118), "CONQUEST • Vale dos Conjuntos (Unity URP)");
            GUI.Label(new Rect(32, 42, 415, 22), "Explore a vila. Cristais: " + ConquestCrystal.Collected + " / 3");
            GUI.Label(new Rect(32, 65, 415, 22), "WASD mover • Shift correr • Espaco pular • Q/R camera");
            GUI.Label(new Rect(32, 88, 415, 22), "Mouse direito: orbitar • Scroll: zoom • F1/F2/F3: qualidade");
            GUI.Label(new Rect(18, 139, 440, 25),
                "Preset: " + (preset == 0 ? "Baixo" : preset == 1 ? "Medio" : "Alto") +
                " | FPS estimado: " + Mathf.RoundToInt(1f / frameTime));
        }
    }
}
