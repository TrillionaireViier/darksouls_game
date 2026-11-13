using UnityEngine;
using UnityEngine.UI;

namespace DarkSouls
{
    public class DarkSoulsHUD : MonoBehaviour
    {
        [Header("Bars")]
        public Image healthBarFill;
        public Image staminaBarFill;
        public Text healthText;
        public Text estusText;
        public Text soulsText;

        [Header("Boss HUD")]
        public GameObject bossContainer;
        public Text bossNameText;
        public Image bossBarFill;

        [Header("Overlays")]
        public GameObject deathScreen;
        public GameObject bonfireBanner;
        public GameObject victoryBanner;
        public Text notificationText;

        public void UpdateHealth(float current, float max)
        {
            if (healthBarFill != null) healthBarFill.fillAmount = current / max;
            if (healthText != null) healthText.text = $"{(int)current} / {(int)max}";
        }

        public void UpdateStamina(float current, float max)
        {
            if (staminaBarFill != null) staminaBarFill.fillAmount = current / max;
        }

        public void UpdateEstus(int current, int max)
        {
            if (estusText != null) estusText.text = $"x {current}";
        }

        public void UpdateSouls(int amount)
        {
            if (soulsText != null) soulsText.text = amount.ToString();
        }

        public void ShowNotification(string msg)
        {
            if (notificationText != null)
            {
                notificationText.text = msg;
                notificationText.gameObject.SetActive(true);
                CancelInvoke(nameof(HideNotification));
                Invoke(nameof(HideNotification), 2.5f);
            }
        }

        private void HideNotification()
        {
            if (notificationText != null) notificationText.gameObject.SetActive(false);
        }

        public void ShowBoss(string name)
        {
            if (bossContainer != null)
            {
                bossNameText.text = name;
                bossContainer.SetActive(true);
            }
        }

        public void UpdateBossHealth(float current, float max)
        {
            if (bossBarFill != null) bossBarFill.fillAmount = current / max;
        }

        public void ShowDeathScreen()
        {
            if (deathScreen != null) deathScreen.SetActive(true);
        }

        public void ShowBonfireLit()
        {
            if (bonfireBanner != null)
            {
                bonfireBanner.SetActive(true);
                Invoke(nameof(HideBonfireLit), 3f);
            }
        }

        private void HideBonfireLit()
        {
            if (bonfireBanner != null) bonfireBanner.SetActive(false);
        }

        public void ShowVictory()
        {
            if (bossContainer != null) bossContainer.SetActive(false);
            if (victoryBanner != null)
            {
                victoryBanner.SetActive(true);
                Invoke(nameof(HideVictory), 4f);
            }
        }

        private void HideVictory()
        {
            if (victoryBanner != null) victoryBanner.SetActive(false);
        }
    }
}
