# PHASE 3: INITIAL REPOSITORY AUDIT & TECHNICAL ASSESSMENT
## Enterprise AI Virtual Receptionist Kiosk: Digital Human Avatar Development

**Date:** November 19, 2026  
**Auditor:** Senior 3D Graphics Engineer, Character Animation Engineer, Frontend Architect & Technical Lead  
**Phase:** 3 of 15 (Digital Human Avatar Development)  
**Status:** AUDIT COMPLETED  

---

## 1. Executive Summary & Verification of Prior Phases

Prior to writing code for Phase 3, a full technical audit of the codebase was conducted:

1. **Phase 1 (Backend Foundation & IAM Multi-Tenancy):**
   - **Verified Complete.** FastAPI async service with SQLAlchemy 2.0 ORM models, Alembic migrations (`0001_initial_schema.py`), RFC 7807 error handling, and structured correlation ID logging.
   - All 20 backend pytest tests passing cleanly (`tests/test_auth.py`, `tests/test_config.py`, `tests/test_health.py`, `tests/test_tenants_and_users.py`).
2. **Phase 2 (Touchscreen Kiosk Frontend & Interaction Foundation):**
   - **Verified Complete.** Next.js 15 App Router, React 19, TypeScript 5, Tailwind CSS, Framer Motion.
   - All 18 public and administrative routes prerendered cleanly as static assets.
   - All 45 frontend contract tests passing in `frontend/tests/kiosk-contract.test.mjs`.
   - Dual English/Hindi localization and WCAG accessibility verified.

---

## 2. Avatar Subsystem Audit & 3D Asset Availability

### 2.1 Existing Avatar Implementation
In Phase 2, an initial modular avatar subsystem was scaffolded in `frontend/src/components/avatar/`:
- `AvatarTypes.ts`: Defines operational states (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `ERROR`).
- `AvatarContainer.tsx`: High-level state wrapper.
- `AvatarDisplay.tsx`: 2D animated SVG fallback with pulsing auras and a `#phase3-digital-human-mount` anchor.
- `AvatarStatus.tsx`: Operational state badge and audio waveform bars.
- `AvatarControls.tsx`: Mute button and developer state switcher.

### 2.2 3D Asset Inspection
A recursive filesystem audit of the repository for 3D model formats (`*.glb`, `*.gltf`, `*.obj`, `*.fbx`) was performed:
- **Result:** No commercial or custom 3D character models exist in the repository (`frontend/public/` does not currently contain any character assets).
- **Compliance Policy:** In strict adherence to project requirements:
  > *"If no licensed model is available: Build the renderer and asset-loading pipeline. Provide a clear placeholder/fallback state. Document the exact required model specifications. Do not download or use unlicensed commercial assets."*
  > *"If a real 3D model asset is unavailable, mark the model-dependent requirements BLOCKED or PARTIALLY IMPLEMENTED. Do not falsely declare Phase 3 complete."*

---

## 3. Technical Architecture & Component Structure

To support both live WebGL 3D rendering and graceful degradation on modest kiosk hardware, the following component architecture is established:

```
frontend/src/
├── components/avatar/
│   ├── AvatarScene.tsx            <-- Top-level Three.js canvas & lifecycle manager
│   ├── AvatarRenderer.tsx         <-- Procedural / GLTF 3D mesh rendering pipeline
│   ├── AvatarController.tsx       <-- Programmatic state, expression & lip-sync controller
│   ├── AvatarLighting.tsx         <-- Studio 3-point lighting & soft ambient highlights
│   ├── AvatarCamera.tsx           <-- Receptionist framing camera (eye-level kiosk portrait)
│   ├── AvatarExpressions.tsx      <-- Morph target & expression blend-shape manager
│   ├── AvatarLipSync.tsx          <-- Viseme sequencing & mouth interpolation engine
│   ├── AvatarGestures.tsx         <-- Natural idle breathing, blinking & head tracking
│   ├── AvatarFallback.tsx         <-- WebGL-unsupported & low-power non-3D fallback
│   ├── AvatarLoading.tsx          <-- Holographic loading progress indicator
│   └── AvatarErrorBoundary.tsx    <-- Component-level WebGL crash isolation
├── hooks/
│   ├── useAvatar.ts               <-- Central hook connecting kiosk state to 3D avatar
│   ├── useAvatarAnimation.ts      <-- Animation loop, RAF scheduler & mixer updates
│   ├── useAvatarExpressions.ts    <-- Blend-shape transitions & smoothing
│   └── useAvatarLipSync.ts        <-- Viseme queue playback & audio synchronization
├── types/
│   └── avatar.ts                  <-- Unified 3D types (Viseme, Expression, Quality, State)
└── config/
    └── avatar.config.ts           <-- 3D camera settings, lighting rigs, viseme dictionary
```

---

## 4. Key Technical Risks & Mitigation Strategies

1. **WebGL Canvas Lifecycle & Memory Leaks in Next.js:**
   - *Risk:* Multiple kiosk screen navigations can cause WebGL context losses or GPU VRAM leaks if geometries, textures, materials, and animation mixers are not disposed of.
   - *Mitigation:* Strict disposal lifecycle in `AvatarRenderer` and `useAvatarAnimation` releasing buffers, geometries, materials, and canceling `requestAnimationFrame` loops on unmount.
2. **Hardware Variation Across Kiosks:**
   - *Risk:* Touchscreen kiosks range from high-power Intel Core/NVIDIA workstations to low-power Celeron/embedded GPUs.
   - *Mitigation:* WebGL capability detector with dynamic quality selection (`HIGH`, `MEDIUM`, `LOW`), framerate throttling, and fallback to the 2D animated avatar if WebGL is unavailable or fails.
3. **Mouth Morph Target / Viseme Mapping:**
   - *Risk:* External GLB models may have varying viseme naming conventions (Oculus visemes vs ARKit blend shapes).
   - *Mitigation:* Normalized viseme mapping supporting Preston Blair, Oculus Lipsync, and standard phoneme sets (`viseme_sil`, `viseme_PP`, `viseme_FF`, `viseme_TH`, `viseme_DD`, `viseme_kk`, `viseme_CH`, `viseme_SS`, `viseme_nn`, `viseme_RR`, `viseme_aa`, `viseme_E`, `viseme_I`, `viseme_O`, `viseme_U`).

---

## 5. Execution Plan

1. **Step 1:** Establish types in `src/types/avatar.ts` and configuration in `src/config/avatar.config.ts`.
2. **Step 2:** Build Three.js core scene, lighting, camera, error boundary, and fallback components.
3. **Step 3:** Implement procedural 3D character bust and GLTF/GLB character asset loading pipeline.
4. **Step 4:** Implement expressions, natural gestures (breathing, blinking, head motion), and lip-sync interpolation.
5. **Step 5:** Create hooks (`useAvatar`, `useAvatarAnimation`, `useAvatarExpressions`, `useAvatarLipSync`) and controller API.
6. **Step 6:** Integrate 3D avatar into `/kiosk` and `/kiosk/assistant` screens.
7. **Step 7:** Run tests (`tsc --noEmit`, `npm run test`, `npm run build`), document in `PHASE_3_AVATAR_ARCHITECTURE.md`, and produce evidence-based `PHASE_3_COMPLETION_REPORT.md`.
