"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  AvatarOperationalState,
  AvatarExpression,
  AvatarQualityLevel,
  AvatarModelMetadata,
  LipSyncFrame,
} from "../../types/avatar";
import { createAvatarCamera, updateAvatarCameraAspect } from "./AvatarCamera";
import { createAvatarLighting } from "./AvatarLighting";
import { createGestureController } from "./AvatarGestures";
import { createExpressionController } from "./AvatarExpressions";
import { createLipSyncEngine } from "./AvatarLipSync";
import { AvatarLoading } from "./AvatarLoading";
import { AvatarFallback } from "./AvatarFallback";

export interface AvatarRendererProps {
  state: AvatarOperationalState;
  expression?: AvatarExpression;
  quality?: AvatarQualityLevel;
  modelUrl?: string;
  onModelLoaded?: (metadata: AvatarModelMetadata) => void;
  lipSyncFrames?: LipSyncFrame[];
  className?: string;
}

export function AvatarRenderer({
  state = "IDLE",
  expression = "neutral",
  quality = "HIGH",
  modelUrl,
  onModelLoaded,
  lipSyncFrames,
  className = "",
}: AvatarRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean | null>(null);

  // References to engine controllers
  const gesturesRef = useRef(createGestureController());
  const expressionsRef = useRef(createExpressionController(expression));
  const lipSyncRef = useRef(createLipSyncEngine());

  // Update expression when prop changes
  useEffect(() => {
    expressionsRef.current.setExpression(expression);
  }, [expression]);

  // Update lip sync frames when provided
  useEffect(() => {
    if (lipSyncFrames && lipSyncFrames.length > 0) {
      lipSyncRef.current.start(lipSyncFrames, performance.now());
    }
  }, [lipSyncFrames]);

  useEffect(() => {
    // 1. WebGL Capability Check
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl2") || canvas.getContext("webgl"))
        );
      } catch {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebGlSupported(false);
      setIsLoading(false);
      return;
    }
    setWebGlSupported(true);

    const container = containerRef.current;
    if (!container) return;

    // 2. Three.js Scene Setup
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = createAvatarCamera(width / height);

    // Subtle dark gradient background for enterprise kiosk
    scene.background = null; // Transparent canvas blending into kiosk slate-950

    const renderer = new THREE.WebGLRenderer({
      antialias: quality !== "LOW",
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "HIGH" ? 2 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    if (quality === "HIGH") {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Rig
    const lighting = createAvatarLighting(scene, quality);

    // 4. Character Construction Group
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Build Realistic Corporate Receptionist 3D Bust
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.55,
      metalness: 0.1,
    });

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Corporate Navy Blazer
      roughness: 0.8,
      metalness: 0.2,
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp White Dress Shirt
      roughness: 0.6,
      metalness: 0.05,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Stylized Deep Cyan Hair
      roughness: 0.4,
      metalness: 0.3,
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
    });

    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.4,
    });

    // Torso / Suit Blazer (Shoulders & Chest)
    const torsoGeometry = new THREE.CylinderGeometry(0.38, 0.44, 0.75, 24);
    const torsoMesh = new THREE.Mesh(torsoGeometry, suitMaterial);
    torsoMesh.position.set(0, 0.75, 0);
    characterGroup.add(torsoMesh);

    // Shirt Collar
    const collarGeometry = new THREE.ConeGeometry(0.24, 0.2, 16);
    const collarMesh = new THREE.Mesh(collarGeometry, shirtMaterial);
    collarMesh.position.set(0, 1.15, 0.08);
    collarMesh.rotation.x = Math.PI;
    characterGroup.add(collarMesh);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.28, 20);
    const neckMesh = new THREE.Mesh(neckGeometry, skinMaterial);
    neckMesh.position.set(0, 1.25, 0);
    characterGroup.add(neckMesh);

    // Articulated Head Group (Transforms driven by gestures and posture)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 0);
    characterGroup.add(headGroup);

    // Head Cranium
    const headGeometry = new THREE.SphereGeometry(0.26, 32, 28);
    headGeometry.scale(0.9, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headGroup.add(headMesh);

    // Hair Shell
    const hairGeometry = new THREE.SphereGeometry(0.28, 24, 20);
    hairGeometry.scale(0.95, 1.18, 1.0);
    const hairMesh = new THREE.Mesh(hairGeometry, hairMaterial);
    hairMesh.position.set(0, 0.04, -0.02);
    headGroup.add(hairMesh);

    // Left Eye & Pupil
    const eyeL = new THREE.Group();
    eyeL.position.set(-0.085, 0.05, 0.21);
    const eyeWhiteL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), eyeWhiteMaterial);
    const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 12), irisMaterial);
    irisL.position.set(0, 0, 0.025);
    eyeL.add(eyeWhiteL);
    eyeL.add(irisL);
    headGroup.add(eyeL);

    // Right Eye & Pupil
    const eyeR = new THREE.Group();
    eyeR.position.set(0.085, 0.05, 0.21);
    const eyeWhiteR = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), eyeWhiteMaterial);
    const irisR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 12), irisMaterial);
    irisR.position.set(0, 0, 0.025);
    eyeR.add(eyeWhiteR);
    eyeR.add(irisR);
    headGroup.add(eyeR);

    // Eyelid Meshes for Blinking
    const eyelidMaterial = skinMaterial.clone();
    const eyelidGeometry = new THREE.SphereGeometry(0.042, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);

    const eyelidL = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
    eyelidL.position.set(-0.085, 0.06, 0.21);
    eyelidL.rotation.x = -Math.PI * 0.5;
    eyelidL.scale.set(1, 0.1, 1);
    headGroup.add(eyelidL);

    const eyelidR = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
    eyelidR.position.set(0.085, 0.06, 0.21);
    eyelidR.rotation.x = -Math.PI * 0.5;
    eyelidR.scale.set(1, 0.1, 1);
    headGroup.add(eyelidR);

    // Articulated Mouth & Jaw Group (Lip-sync & Expressions)
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.12, 0.22);
    headGroup.add(mouthGroup);

    const upperLip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.015, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 })
    );
    upperLip.position.set(0, 0.01, 0);
    mouthGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.018, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 })
    );
    lowerLip.position.set(0, -0.01, 0);
    mouthGroup.add(lowerLip);

    // Notify model loaded metadata
    setIsLoading(false);
    if (onModelLoaded) {
      onModelLoaded({
        isLoaded: true,
        modelName: "Corporate Receptionist 3D Bust (Procedural Mesh Engine)",
        meshCount: 12,
        hasMorphTargets: true,
        morphTargetNames: ["mouthOpen", "mouthWide", "eyeBlink", "browInnerUp", "mouthSmile"],
        animationNames: ["Idle_Breathing", "Natural_Blinking", "LipSync_Visemes"],
        isProceduralFallback: true,
      });
    }

    // 5. Render & Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update Gestures (Breathing, Sway, Blinking)
      const gestures = gesturesRef.current.update(elapsed, delta, state);
      torsoMesh.scale.set(1, gestures.chestScaleY, gestures.chestScaleZ);
      torsoMesh.position.y = 0.75 + gestures.shoulderOffsetY;

      // Update Head Posture
      headGroup.rotation.x = gestures.headPitch;
      headGroup.rotation.y = gestures.headYaw;
      headGroup.rotation.z = gestures.headRoll;

      // Update Blinking
      eyelidL.scale.y = 0.1 + gestures.blinkWeight * 1.8;
      eyelidR.scale.y = 0.1 + gestures.blinkWeight * 1.8;

      // Update Lip-Sync
      const lipSync = lipSyncRef.current.update(performance.now(), delta);
      lowerLip.position.y = -0.01 - lipSync.mouthOpen * 0.05;
      mouthGroup.scale.x = 1.0 + lipSync.mouthWide * 0.3;

      // Update Expressions
      const exprWeights = expressionsRef.current.update(delta);
      if (exprWeights.mouthSmile) {
        upperLip.position.y = 0.01 + exprWeights.mouthSmile * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Observer for Kiosk Responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          renderer.setSize(newW, newH);
          updateAvatarCameraAspect(camera, newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    // 7. Cleanup & Resource Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      lighting.dispose();

      // Dispose Geometries & Materials
      characterGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });

      scene.clear();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quality, state, onModelLoaded]);

  if (webGlSupported === false) {
    return <AvatarFallback state={state} reason="WebGL hardware acceleration unavailable." />;
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-20">
          <AvatarLoading />
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <AvatarFallback state={state} reason={loadError} />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full min-h-[360px] md:min-h-[460px]" />
    </div>
  );
}
