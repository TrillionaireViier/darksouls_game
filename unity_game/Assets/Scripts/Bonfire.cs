using System;
using UnityEngine;

namespace DarkSouls
{
    public class Bonfire : MonoBehaviour
    {
        public float interactionRadius = 3.5f;
        public Light bonfireLight;
        public ParticleSystem fireParticles;
        public GameObject promptUI;

        public event Action OnBonfireRested;

        private DarkSoulsPlayer playerInside = null;

        private void Update()
        {
            if (bonfireLight != null)
            {
                float t = Time.time;
                bonfireLight.intensity = 2.4f + Mathf.Sin(t * 12f) * 0.4f + Mathf.Cos(t * 23f) * 0.2f;
            }

            if (playerInside != null && Input.GetKeyDown(KeyCode.E))
            {
                TriggerRest();
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.TryGetComponent<DarkSoulsPlayer>(out var player))
            {
                playerInside = player;
                if (promptUI != null) promptUI.SetActive(true);
            }
        }

        private void OnTriggerExit(Collider other)
        {
            if (other.TryGetComponent<DarkSoulsPlayer>(out var player) && player == playerInside)
            {
                playerInside = null;
                if (promptUI != null) promptUI.SetActive(false);
            }
        }

        public void TriggerRest()
        {
            if (playerInside != null)
            {
                playerInside.RestAtBonfire(transform.position);
                OnBonfireRested?.Invoke();
            }
        }
    }
}
