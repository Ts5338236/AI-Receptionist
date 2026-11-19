# PHASE 2: COMPONENT CATALOG & INTERACTION SPECIFICATION
## AI Receptionist Enterprise Frontend Component System

---

## 1. Modular Avatar Subsystem (`src/components/avatar/`)

The avatar module is completely decoupled from the rest of the application so that Phase 3 (3D model, WebRTC live audio/video track feed) can replace or enhance the visual stage without restructuring page layouts.

### Component Manifest

| Component | File | Responsibilities |
| :--- | :--- | :--- |
| **`AvatarContainer`** | `AvatarContainer.tsx` | Composes Display, Status, and Controls. Manages internal/controlled state. |
| **`AvatarDisplay`** | `AvatarDisplay.tsx` | SVG visual face, natural eye blink intervals, reactive lip-sync motion, glow aura, and `#phase3-digital-human-mount` hook. |
| **`AvatarStatus`** | `AvatarStatus.tsx` | Operational state badge (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `ERROR`) and live multi-bar audio waveform. |
| **`AvatarControls`** | `AvatarControls.tsx` | Mute/unmute toggle and developer test state switcher for kiosk QA verification. |
| **`AvatarAnimations`**| `AvatarAnimations.tsx`| Framer Motion variants for orbital rotation, breathing pulses, and waveform bars. |
| **`AvatarTypes`** | `AvatarTypes.ts` | TypeScript type declarations for states, emotions, and configuration. |

### Operational State Model

```typescript
export type AvatarState =
  | "IDLE"      // Waiting for visitor presence or touch
  | "LISTENING" // Actively capturing microphone audio stream
  | "THINKING"  // Querying LLM / RAG knowledge index
  | "SPEAKING"  // Synthesizing speech and animating lip-sync
  | "ERROR";    // Microphone unplugged or network dropped
```

---

## 2. Reusable UI Components (`src/components/ui/`)

| Component | Props | Purpose |
| :--- | :--- | :--- |
| **`PrimaryButton`** | `isLoading`, `icon`, `size`, `className` | High-emphasis tactile CTA ($\ge 56\text{px}$) with gradient and focus ring. |
| **`SecondaryButton`**| `isLoading`, `icon`, `size`, `className` | Tactile slate button for secondary actions, returns, and cancel buttons. |
| **`IconButton`** | `icon`, `label`, `variant`, `size` | Touch-accessible square button ($\ge 48\text{px}$) with tooltip and ARIA label. |
| **`ActionCard`** | `title`, `description`, `href`, `icon`, `badge` | 6 tactile cards on the welcome screen with gradient backdrops and arrows. |
| **`Modal`** | `isOpen`, `onClose`, `title`, `maxWidth`, `children` | Full-screen glassmorphic dialog with backdrop blur and ESC/touch dismiss. |
| **`Drawer`** | `isOpen`, `onClose`, `title`, `position`, `children` | Off-canvas slide-over panel for menus, settings, and floor details. |
| **`Dialog`** | `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `type` | Two-button prompt for confirmations, session terminations, or alerts. |
| **`Toast`** | `type`, `message`, `description`, `onDismiss`, `autoDismissMs` | Floating bottom notification with auto-dismiss countdown. |
| **`LoadingIndicator`**| `label`, `size` | Spinning cyan ring with radar pulse for asynchronous API calls. |
| **`ErrorState`** | `title`, `message`, `onRetry`, `retryLabel` | Prominent error box with recovery action. |
| **`EmptyState`** | `icon`, `title`, `description`, `actionLabel`, `onAction` | Graceful placeholder when search yields no matches. |
| **`LanguageSelector`**| `onSelect`, `className` | Dedicated bilingual switch interface supporting English (`en`) and Hindi (`hi`). |
| **`AccessibilityToolbar`**| `className`, `onClose` | Quick toggle for high-contrast mode and 3-step font magnification. |
| **`KioskHeader`** | `showBackToHome` | Unified top telemetry bar showing clock, network, and hardware health. |
| **`KioskFooter`** | `secondsRemaining`, `isWarning` | Bottom control bar housing Conversation CTA and system modals. |

---

## 3. Context & State Providers

### `LanguageContext` (`src/context/language-context.tsx`)
- Provides `language: SupportedLanguage` (`en` | `hi`).
- Provides `setLanguage(lang)`.
- Provides `t: Translations` with over 40 fully typed, synchronized keys.
- Persists user language preference to `localStorage("kiosk_language")`.

### `AccessibilityContext` (`src/context/accessibility-context.tsx`)
- Provides `highContrast: boolean` (toggles high-contrast CSS filters).
- Provides `textScale: TextScale` (`normal`, `large`, `xlarge`).
- Provides `setTextScale(scale)`, `increaseTextSize()`, and `decreaseTextSize()`.
- Persists user preferences and applies classes directly to the root kiosk viewport.

### `useKioskSession` (`src/hooks/use-kiosk-session.ts`)
- Configurable timeout (default 60–90 seconds).
- Tracks mouse, pointer, touch, and keyboard events.
- Warns users when 15 seconds remain with a countdown timer.
- Purges temporary form inputs and session tokens before routing back to `/kiosk`.
