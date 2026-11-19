import * as THREE from "three";

export function createAvatarCamera(
  aspectRatio: number,
  fov: number = 32
): THREE.PerspectiveCamera {
  // Eye-level framing: positioned slightly above chest level looking at avatar's face
  const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 20);

  // Default portrait reception kiosk framing (head & shoulders portrait)
  if (aspectRatio < 1) {
    // Portrait orientation: move slightly further back to ensure shoulders are visible
    camera.position.set(0, 1.45, 2.8);
  } else {
    // Landscape orientation: closer framing centered on face & upper chest
    camera.position.set(0, 1.4, 2.2);
  }

  camera.lookAt(0, 1.35, 0);

  return camera;
}

export function updateAvatarCameraAspect(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): void {
  const aspect = width / height;
  camera.aspect = aspect;

  if (aspect < 1) {
    camera.position.z = 2.8;
    camera.position.y = 1.45;
  } else {
    camera.position.z = 2.2;
    camera.position.y = 1.4;
  }

  camera.lookAt(0, 1.35, 0);
  camera.updateProjectionMatrix();
}
