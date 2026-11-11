using UnityEngine;

namespace Conquest.UnityRemake
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class ConquestCharacterMotor : MonoBehaviour
    {
        [Header("Movimento")]
        [SerializeField] private float walkSpeed = 4.2f;
        [SerializeField] private float runSpeed = 7.2f;
        [SerializeField] private float acceleration = 14f;
        [SerializeField] private float turnSpeed = 12f;
        [SerializeField] private float jumpHeight = 1.25f;

        [Header("Visual procedural (substituir por rig Humanoid futuramente)")]
        public Transform leftArm;
        public Transform rightArm;
        public Transform leftLeg;
        public Transform rightLeg;

        private CharacterController character;
        private float verticalVelocity;
        private float currentSpeed;
        private float animationClock;
        private bool running;

        private void Awake()
        {
            character = GetComponent<CharacterController>();
        }

        private void Update()
        {
            float horizontal = (Input.GetKey(KeyCode.D) ? 1 : 0) - (Input.GetKey(KeyCode.A) ? 1 : 0);
            float vertical = (Input.GetKey(KeyCode.W) ? 1 : 0) - (Input.GetKey(KeyCode.S) ? 1 : 0);
            Vector3 input = Vector3.ClampMagnitude(new Vector3(horizontal, 0f, vertical), 1f);

            Transform view = Camera.main ? Camera.main.transform : transform;
            Vector3 cameraForward = Vector3.ProjectOnPlane(view.forward, Vector3.up).normalized;
            Vector3 cameraRight = Vector3.ProjectOnPlane(view.right, Vector3.up).normalized;
            Vector3 direction = cameraRight * input.x + cameraForward * input.z;
            if (direction.sqrMagnitude > 1f) direction.Normalize();

            running = Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);
            float targetSpeed = input.sqrMagnitude > 0.01f ? (running ? runSpeed : walkSpeed) : 0f;
            currentSpeed = Mathf.MoveTowards(currentSpeed, targetSpeed, acceleration * Time.deltaTime);

            if (direction.sqrMagnitude > 0.01f)
            {
                Quaternion desired = Quaternion.LookRotation(direction, Vector3.up);
                transform.rotation = Quaternion.Slerp(transform.rotation, desired, turnSpeed * Time.deltaTime);
            }

            if (character.isGrounded && verticalVelocity < 0f) verticalVelocity = -2f;
            if (character.isGrounded && Input.GetKeyDown(KeyCode.Space))
                verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * Physics.gravity.y);
            verticalVelocity += Physics.gravity.y * Time.deltaTime;
            Vector3 motion = direction * currentSpeed + Vector3.up * verticalVelocity;
            character.Move(motion * Time.deltaTime);

            AnimatePlaceholder();
        }

        private void AnimatePlaceholder()
        {
            float activity = Mathf.Clamp01(currentSpeed / Mathf.Max(walkSpeed, 0.1f));
            animationClock += Time.deltaTime * (running ? 11f : 7f) * activity;
            float swing = Mathf.Sin(animationClock) * 32f * activity;
            if (leftArm) leftArm.localRotation = Quaternion.Euler(swing, 0f, 0f);
            if (rightArm) rightArm.localRotation = Quaternion.Euler(-swing, 0f, 0f);
            if (leftLeg) leftLeg.localRotation = Quaternion.Euler(-swing * .7f, 0f, 0f);
            if (rightLeg) rightLeg.localRotation = Quaternion.Euler(swing * .7f, 0f, 0f);
        }
    }
}
