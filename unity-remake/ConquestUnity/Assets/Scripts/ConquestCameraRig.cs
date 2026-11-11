using UnityEngine;

namespace Conquest.UnityRemake
{
    [RequireComponent(typeof(Camera))]
    public sealed class ConquestCameraRig : MonoBehaviour
    {
        public Transform target;
        [Range(3f, 14f)] public float distance = 7.3f;
        [Range(0.5f, 12f)] public float followSharpness = 7f;
        [Range(0.3f, 10f)] public float mouseSensitivity = 2.1f;
        public float cameraHeight = 1.6f;
        public float yaw = 0f;
        public float pitch = 18f;

        private void LateUpdate()
        {
            if (!target) return;
            if (Input.GetMouseButton(1))
            {
                yaw += Input.GetAxis("Mouse X") * mouseSensitivity * 2f;
                pitch -= Input.GetAxis("Mouse Y") * mouseSensitivity * 1.5f;
            }
            if (Input.GetKey(KeyCode.Q)) yaw -= 85f * Time.deltaTime;
            if (Input.GetKey(KeyCode.R)) yaw += 85f * Time.deltaTime;
            pitch = Mathf.Clamp(pitch, -15f, 67f);
            distance = Mathf.Clamp(distance - Input.mouseScrollDelta.y, 3f, 14f);

            Vector3 pivot = target.position + Vector3.up * cameraHeight;
            Quaternion orbit = Quaternion.Euler(pitch, yaw, 0f);
            Vector3 backward = orbit * Vector3.back;
            float safeDistance = distance;

            // Player e visuais no layer Ignore Raycast; paredes/terrain bloqueiam camera.
            int mask = ~(1 << 2);
            if (Physics.SphereCast(pivot, .22f, backward, out RaycastHit hit, distance,
                    mask, QueryTriggerInteraction.Ignore))
            {
                safeDistance = Mathf.Max(0.55f, hit.distance - .25f);
            }

            Vector3 desired = pivot + backward * safeDistance;
            float smoothing = 1f - Mathf.Exp(-followSharpness * Time.deltaTime);
            transform.position = Vector3.Lerp(transform.position, desired, smoothing);
            transform.rotation = Quaternion.LookRotation(pivot - transform.position, Vector3.up);
        }
    }
}
