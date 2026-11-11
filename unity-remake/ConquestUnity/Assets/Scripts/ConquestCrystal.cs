using UnityEngine;

namespace Conquest.UnityRemake
{
    [RequireComponent(typeof(SphereCollider))]
    public sealed class ConquestCrystal : MonoBehaviour
    {
        public string crystalName = "Cristal do Conhecimento";
        public Transform visual;
        public Light glow;
        private Vector3 basePosition;

        public static int Collected { get; private set; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ResetProgress() { Collected = 0; }

        private void Start()
        {
            basePosition = visual ? visual.localPosition : Vector3.zero;
            SphereCollider trigger = GetComponent<SphereCollider>();
            trigger.isTrigger = true;
            trigger.radius = 1.6f;
        }

        private void Update()
        {
            if (visual)
            {
                visual.Rotate(Vector3.up, 48f * Time.deltaTime, Space.Self);
                visual.localPosition = basePosition + Vector3.up * (Mathf.Sin(Time.time * 2.1f) * .19f);
            }
            if (glow) glow.intensity = 2.1f + Mathf.Sin(Time.time * 3f) * .45f;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (!other.GetComponent<ConquestCharacterMotor>()) return;
            Collected++;
            Debug.Log("Conquest: " + crystalName + " encontrado (" + Collected + "/3).");
            gameObject.SetActive(false);
        }
    }
}
