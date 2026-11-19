import * as THREE from "three";
import { AvatarQualityLevel } from "../../types/avatar";

export interface AvatarLightingRig {
  ambientLight: THREE.AmbientLight;
  keyLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  stageGlow: THREE.PointLight;
  dispose: () => void;
}

export function createAvatarLighting(
  scene: THREE.Scene,
  quality: AvatarQualityLevel = "HIGH"
): AvatarLightingRig {
  // 1. Ambient Base Light
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.9);
  scene.add(ambientLight);

  // 2. Key Light (Primary front-top lighting at 45 degree angle)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(1.5, 2.5, 2.5);
  if (quality === "HIGH") {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.bias = -0.0005;
  }
  scene.add(keyLight);

  // 3. Fill Light (Soft cool blue tone from opposite side to soften shadows)
  const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
  fillLight.position.set(-2, 1.2, 1.8);
  scene.add(fillLight);

  // 4. Rim Light (Backlight creating professional silhouette highlight on shoulders and hair)
  const rimLight = new THREE.DirectionalLight(0x0284c7, 1.2);
  rimLight.position.set(0, 2.2, -2.5);
  scene.add(rimLight);

  // 5. Stage Glow (Point light in chest-height stage)
  const stageGlow = new THREE.PointLight(0x06b6d4, 0.5, 5);
  stageGlow.position.set(0, -0.5, 1);
  scene.add(stageGlow);

  return {
    ambientLight,
    keyLight,
    fillLight,
    rimLight,
    stageGlow,
    dispose: () => {
      scene.remove(ambientLight);
      scene.remove(keyLight);
      scene.remove(fillLight);
      scene.remove(rimLight);
      scene.remove(stageGlow);
      ambientLight.dispose();
      keyLight.dispose();
      fillLight.dispose();
      rimLight.dispose();
      stageGlow.dispose();
    },
  };
}
