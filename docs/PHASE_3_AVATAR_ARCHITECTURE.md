# PHASE 3: DIGITAL HUMAN AVATAR ARCHITECTURE & SPECIFICATION

**Product:** AI Receptionist Enterprise  
**Subsystem:** Digital Human Avatar 3D Rendering & Animation Engine  
**Author:** Senior 3D Graphics Engineer & Character Animation Architect  
**Status:** Completed & Integrated  

---

## 1. Executive Summary

Phase 3 introduces an enterprise-grade 3D graphics and digital human animation engine into the AI Receptionist Kiosk frontend. The system is architected to render a lifelike, conversational digital human receptionist directly within the browser using WebGL / Three.js, with continuous procedural gestures (breathing, micro-movements, stochastic blinking), emotion blend-shape morphing, and a provider-independent phonetic lip-sync engine.

Because no proprietary, licensed 3D character asset (`.glb` / `.gltf`) was supplied in the initial repository, the graphics pipeline implements a dual-mode strategy:
1. **Procedural 3D Humanoid Bust Rig:** An articulated Three.js humanoid mesh complete with dynamic morphing mouth, blinking eyelids, moving pupils, and neck articulation that executes all lighting, gestures, expressions, and lip-syncing out-of-the-box.
2. **Standardized GLTF 2.0 Ingestion Pipeline:** An asset loading framework that instantly switches from the procedural rig to an enterprise photorealistic 3D character model whenever a licensed `.glb` conforming to the defined blend-shape standards is placed into `frontend/public/models/receptionist.glb`.
3. **Graceful 2D Fallback:** An SVG/CSS vector animation layer activated automatically when WebGL is unsupported or encounters context loss.

---

## 2. System Architecture & Component Hierarchy

The avatar engine is isolated into dedicated, modular components under `frontend/src/components/avatar/` and state hooks under `frontend/src/hooks/`:

```
frontend/src/
├── types/
│   └── avatar.ts                     # Operational states, Visemes, Expressions, Model metadata
├── config/
│   └── avatar.config.ts              # Lighting, Camera, Viseme Map, Blend shapes, Asset specifications
├── hooks/
│   ├── useAvatar.ts                  # State management & expression auto-synchronization
│   ├── useAvatarAnimation.ts         # requestAnimationFrame render loop & delta timing
│   ├── useAvatarExpressions.ts       # Morph target weight interpolation with cubic easing
│   └── useAvatarLipSync.ts           # Real-time viseme queueing and mouth target dampening
└── components/
    └── avatar/
        ├── AvatarScene.tsx           # Canvas container, error boundary, status badges & controls
        ├── AvatarRenderer.tsx        # Three.js WebGL renderer, procedural humanoid bust, asset loader
        ├── AvatarController.tsx      # Imperative API handle for external control
        ├── AvatarLighting.tsx        # Photographic studio 3-point lighting rig
        ├── AvatarCamera.tsx          # Dynamic framing perspective camera (landscape & portrait)
        ├── AvatarExpressions.tsx     # Morph target / blend shape controller
        ├── AvatarGestures.tsx        # Procedural breathing (14 bpm), blinking & state postures
        ├── AvatarLipSync.tsx         # Phonetic viseme interpolator & phrase player
        ├── AvatarLoading.tsx         # Holographic loading state with progress display
        └── AvatarFallback.tsx        # High-fidelity SVG/CSS vector animation fallback
```

---

## 3. Graphics & Rendering Specifications

### 3.1 Three.js WebGL Configuration
- **Antialiasing:** FXAA + WebGL multisample antialiasing (`antialias: true`).
- **Color Space:** `SRGBColorSpace` for accurate PBR surface rendering.
- **Tone Mapping:** `ACESFilmicToneMapping` with exposure set to `1.08` for filmic enterprise visual tones.
- **Shadow Mapping:** `PCFSoftShadowMap` for soft, photographic contact shadows.
- **Pixel Ratio:** Clamped to `Math.min(window.devicePixelRatio, 2.0)` to maintain high visual clarity on high-DPI kiosk displays while preserving frame budgets.
- **Disposal Lifecycle:** Clean teardown of all geometries, materials, textures, render targets, animation loops, and event listeners on unmount.

### 3.2 Studio 3-Point Lighting Rig (`AvatarLighting.tsx`)
1. **Key Light:** Directional light at `[1.8, 2.2, 2.4]`, color `#ffffff`, intensity `2.2`. Casts soft 1024x1024 shadows with camera frustum tuned for portrait bust framing.
2. **Fill Light:** Directional light at `[-1.8, 0.8, 1.8]`, color `#93c5fd` (cool soft blue), intensity `0.9` to soften facial shadows.
3. **Rim Light:** Directional backlight at `[0.0, 2.8, -2.2]`, color `#60a5fa`, intensity `2.8` creating edge separation against the background.
4. **Stage Glow Light:** Point light positioned below at `[0.0, -0.6, 0.8]`, color `#38bdf8`, intensity `0.5`, radius `4.0m` for futuristic ambient ground bounce.
5. **Hemisphere Light:** Sky color `#e0f2fe`, ground color `#0f172a`, intensity `0.6` ensuring no pitch-black unlit crevices.

### 3.3 Dynamic Camera Framing (`AvatarCamera.tsx`)
- **Field of View:** 38° vertical FOV for portrait-lens flattering perspective distortion.
- **Landscape Viewport:** Position `[0.0, 1.52, 1.95]`, target `[0.0, 1.44, 0.0]`.
- **Portrait Viewport:** Position `[0.0, 1.48, 2.50]`, target `[0.0, 1.40, 0.0]`.
- **Clipping Planes:** Near: `0.1m`, Far: `20.0m`.

---

## 4. Animation & Natural Movement Engine

### 4.1 Natural Breathing Cycle (`AvatarGestures.tsx`)
- Human breathing at resting state averages 12–16 breaths per minute.
- Rate: `14 breaths/min` (`frequency = 0.233 Hz`).
- Chest/torso expansion: vertical translation of `0.007m` and z-scale breathing oscillation of `1.012`.
- Head counter-oscillation: subtle vertical pitch tilt (`0.003 rad`) inverted to torso movement to mimic realistic spinal mechanics.

### 4.2 Stochastic Eye Blinking
- Non-periodic biological blinking model utilizing a pseudo-Poisson distribution.
- Blink intervals randomly sampled between `2.8s` and `5.2s`.
- Blink duration: `140ms` total (closing: `45ms`, reopening: `95ms`).
- Eyelid morph target / eyelid geometry displacement interpolated via smooth Hermite curves.

### 4.3 State Postures & Micro-Gestures
The avatar posture dynamically reflects the kiosk's operational state:
- **`IDLE`:** Neutral upright posture with organic micro-sway (`0.003 rad` lateral Lissajous curve).
- **`LISTENING`:** Attentive posture with head tilted forward (`-0.035 rad` pitch) and slightly lateral (`0.025 rad` yaw) as if listening closely to the visitor's voice.
- **`THINKING`:** Contemplative posture with head angled slightly upward (`+0.040 rad` pitch) and subtle side glance.
- **`SPEAKING`:** Dynamic conversational head nods synchronized to phrase cadence (`0.030 rad` amplitude).
- **`GREETING`:** Welcoming polite nod (`-0.060 rad` pitch) with a warm open expression.
- **`ERROR`:** Concerned slight downward posture (`-0.020 rad` pitch).

---

## 5. Blend-Shape Expression System (`AvatarExpressions.tsx`)

The system supports 8 discrete emotional states with configurable transition speeds and smooth cubic easing:

| Expression | Primary Blend Shapes | Emotional Tone |
|:---|:---|:---|
| **NEUTRAL** | Baseline rest pose | Calm, poised, professional |
| **HAPPY** | `mouthSmile: 0.85`, `browInnerUp: 0.25`, `eyeSquint: 0.30` | Warm, approachable receptionist |
| **THINKING** | `browDown_L: 0.45`, `browDown_R: 0.20`, `mouthPucker: 0.20` | Engaged in query processing |
| **CONCERNED** | `browInnerUp: 0.65`, `mouthFrown: 0.50` | Empathetic error handling |
| **SURPRISED** | `eyeWide: 0.70`, `jawOpen: 0.35`, `browInnerUp: 0.75` | Expressive reaction |
| **CONFIDENT** | `mouthSmile: 0.55`, `browDown: 0.15` | Authoritative check-in confirmation |
| **ATTENTIVE** | `eyeWide: 0.20`, `browInnerUp: 0.25` | Active listening state |
| **POLITE_SMILE** | `mouthSmile: 0.60`, `mouthDimple: 0.35` | Standard professional greeting |

All morph targets are smoothly dampened using frame-rate independent interpolation:
$$W_{t+\Delta t} = W_t + (W_{\text{target}} - W_t) \cdot (1 - e^{-\lambda \Delta t})$$
where $\lambda$ governs the transition responsiveness ($k_{\text{easing}} = 8.0\,\text{s}^{-1}$).

---

## 6. Phonetic Lip-Sync Engine (`AvatarLipSync.tsx`)

The lip-sync subsystem is audio-provider agnostic and supports industry-standard viseme mapping (Oculus Speech / ARKit / Preston Blair phonetic models):

### 6.1 Viseme Mapping (`VISEME_MAP`)
- **`viseme_sil`:** Rest position (`mouthOpen: 0.0`, `mouthWide: 0.0`)
- **`viseme_PP` (p, b, m):** Lips pressed together (`mouthOpen: 0.05`, `mouthWide: 0.10`)
- **`viseme_FF` (f, v):** Lower lip to upper teeth (`mouthOpen: 0.18`, `mouthWide: 0.15`)
- **`viseme_TH` (th):** Tongue behind teeth (`mouthOpen: 0.22`, `mouthWide: 0.20`)
- **`viseme_DD` (t, d, n, s, z):** Alveolar tap (`mouthOpen: 0.30`, `mouthWide: 0.40`)
- **`viseme_kk` (k, g, ng):** Velar closure (`mouthOpen: 0.35`, `mouthWide: 0.25`)
- **`viseme_CH` (ch, j, sh):** Palato-alveolar flare (`mouthOpen: 0.42`, `mouthWide: 0.15`)
- **`viseme_SS` (s, z):** High-frequency narrow aperture (`mouthOpen: 0.15`, `mouthWide: 0.35`)
- **`viseme_nn` (n, l):** Tongue roof contact (`mouthOpen: 0.25`, `mouthWide: 0.30`)
- **`viseme_RR` (r):** Lip rounding (`mouthOpen: 0.28`, `mouthWide: -0.10`)
- **`viseme_aa` (a, ah):** Wide open jaw (`mouthOpen: 0.85`, `mouthWide: 0.45`)
- **`viseme_E` (e, eh):** Medium jaw, wide corners (`mouthOpen: 0.50`, `mouthWide: 0.65`)
- **`viseme_I` (i, ee):** High jaw, maximum smile width (`mouthOpen: 0.35`, `mouthWide: 0.80`)
- **`viseme_O` (o, oh):** Moderate jaw, strong lip round (`mouthOpen: 0.65`, `mouthWide: -0.30`)
- **`viseme_U` (u, oo):** Small aperture, maximum funnel (`mouthOpen: 0.35`, `mouthWide: -0.50`)

### 6.2 Viseme Frame Queue & Interpolation
- Frames arrive with timestamp offsets and duration (in milliseconds).
- The player processes viseme targets with smooth lead-in and decay times to eliminate jarring robotic mouth snaps.
- Built-in test phrase runner converts strings to phoneme sequences for automated visual and headless testing.

---

## 7. 3D Model Asset Ingestion Specification

To replace the procedural bust with a custom photorealistic 3D avatar (e.g., from Ready Player Me, Unreal Metahuman export, or Blender), developers must conform to the following specifications:

| Parameter | Specification Requirement |
|:---|:---|
| **File Format** | Standard GLTF 2.0 Binary (`.glb`) |
| **Drop Location** | `frontend/public/models/receptionist.glb` |
| **Polygon Budget** | 35,000 – 50,000 triangles (Bust / Head & Torso) |
| **Rigging Structure** | Standard humanoid hierarchy: `Hips`, `Spine`, `Spine1`, `Spine2`, `Neck`, `Head`, `LeftEye`, `RightEye` |
| **Morph Targets (ARKit)** | `jawOpen`, `mouthSmileLeft`, `mouthSmileRight`, `mouthFrownLeft`, `mouthFrownRight`, `mouthPucker`, `mouthFunnel`, `browInnerUp`, `browDownLeft`, `browDownRight`, `eyeBlinkLeft`, `eyeBlinkRight`, `eyeWideLeft`, `eyeWideRight` |
| **Texture Maps** | BaseColor (2048x2048), Normal (2048x2048), Roughness/Metallic packed (2048x2048) |
| **Texture Formats** | WebP or KTX2 Basis Universal compression recommended for fast kiosk loading |

When `frontend/public/models/receptionist.glb` is placed, `AvatarRenderer.tsx` detects the asset, loads it via `GLTFLoader`, maps the corresponding blend shapes to the morph target dictionary, and smoothly transitions out the procedural bust.

---

## 8. Graceful Fallback Strategy

In the event of:
- Absence of WebGL 2.0 support on legacy kiosk operating systems,
- GPU hardware acceleration disabled by system policy,
- WebGL context loss due to GPU crash or power state transitions,

The `AvatarErrorBoundary` intercepts the failure and mounts `AvatarFallback.tsx`. This vector fallback renders:
- An SVG animated receptionist bust featuring subtle breathing animation,
- Pulsing voice wave rings indicating conversational activity,
- Expressive status badges (`Listening...`, `Speaking...`, `Processing...`),
- Zero WebGL overhead with 100% kiosk UI availability.

---

## 9. Performance & Memory Management

- **Target Framerate:** 60 FPS on 1080p kiosk touchscreens (30 FPS power-save mode configurable).
- **Draw Call Budget:** Under 35 draw calls per frame.
- **Resource Disposal:** All Three.js objects (materials, geometries, renderers) implement strict disposal routines in `useEffect` cleanup handlers, preventing VRAM leaks across long kiosk uptime (24/7 continuous operation).

---

## 10. Phase 4 Preparation & Integration Hooks

The avatar subsystem exposes an imperative handle `AvatarControllerAPI` allowing Phase 4 (Voice & Speech Processing) to immediately drive the avatar:
- `avatarRef.current.setState(AvatarOperationalState.LISTENING)`: Triggers attentive posture when visitor speaks.
- `avatarRef.current.setState(AvatarOperationalState.THINKING)`: Triggers thinking gaze while LLM processes.
- `avatarRef.current.playVisemes(frames)`: Feeds real-time visemes from TTS audio alignment tokens.
- `avatarRef.current.setExpression(expression, 0.3)`: Modulates emotional tone based on sentiment analysis.

This architecture ensures zero refactoring will be required when the voice pipeline is introduced.
