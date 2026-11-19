# PHASE 2: FRONTEND ARCHITECTURE SPECIFICATION
## AI Receptionist Enterprise Kiosk Frontend

**Product Name:** AI Receptionist Enterprise  
**Component:** Touchscreen Kiosk Client Application  
**Framework:** Next.js 15/16 App Router with React 19 & TypeScript 5  
**Version:** 2.0.0-phase2  
**Security Classification:** Public Interactive Terminal  

---

## 1. Architectural Overview & Design Principles

The frontend architecture of the AI Receptionist Enterprise platform is designed specifically for public touchscreen kiosk hardware operating in physical corporate lobbies and enterprise facilities.

```
+-----------------------------------------------------------------------------------+
|                           PHYSICAL KIOSK TERMINAL                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                     Next.js 15/16 Client Viewport                           |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | Root Kiosk Layout (App Router: (kiosk)/layout.tsx)                    |  |  |
|  |  | - LanguageProvider (Bilingual en/hi Context + Persistence)            |  |  |
|  |  | - AccessibilityProvider (High Contrast + 3-Tier Font Scaler)        |  |  |
|  |  | - Inactivity Tracker (useKioskSession: 60-90s Auto Session Purge)     |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                                     |                                       |  |
|  |       +-----------------------------+-----------------------------+         |  |
|  |       |                                                           |         |  |
|  |  +----+--------------------------------+   +----------------------+------+  |  |
|  |  |       Touchscreen UI Stage          |   |      Digital Human Subsystem|  |  |
|  |  | - Welcome Screen (/kiosk)           |   | - AvatarContainer (State)   |  |  |
|  |  | - Multimodal Chat (/assistant)      |   | - AvatarDisplay (SVG Glow)  |  |  |
|  |  | - Visitor Check-In (/visitor)       |   | - AvatarStatus (Waveform)   |  |  |
|  |  | - Appointments & QR (/appointments) |   | - AvatarControls (Audio)    |  |  |
|  |  | - Staff Directory (/employee-dir)   |   | - #phase3-webrtc-mount      |  |  |
|  |  | - Wayfinding (/department-nav)      |   +-----------------------------+  |  |
|  |  | - Help & Concierge (/assistance)    |                                    |  |
|  |  | - Privacy Policy (/privacy)         |                                    |  |
|  |  +-------------------------------------+                                    |  |
|  |                                     |                                       |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |                        Typed API Services Layer                       |  |  |
|  |  | - apiClient (RFC 7807 problem details, correlation ID, timeouts)       |  |  |
|  |  | - visitorService, appointmentService, employeeService, deptService     |  |  |
|  |  | - conversationService, authService                                    |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         |  HTTPS / TLS 1.3
                                         v
+-----------------------------------------------------------------------------------+
|                          FASTAPI BACKEND & INFRASTRUCTURE                         |
|   /api/v1/health/*  |  /api/v1/auth/*  |  /api/v1/tenants/*  |  PostgreSQL / Redis|
+-----------------------------------------------------------------------------------+
```

### Architectural Principles:
1. **Public vs. Protected Route Segregation:**
   - Public kiosk visitors are restricted entirely within the `(kiosk)` route group (`/kiosk/*`).
   - Administrative and operational dashboards (`/admin`, `/dashboard`, `/settings`, `/login`) reside in isolated route groups with authentication guards, preventing accidental or unauthorized access by lobby visitors.
2. **Zero In-Memory Data Retention Across Sessions:**
   - Personal identifiable information (PII) entered during visitor registration or conversation transcripts is held strictly in ephemeral React state.
   - Upon session timeout (or when clicking "End Conversation" / "Session Reset"), all temporary buffers, form fields, and transcripts are instantly purged.
3. **Subsystem Modularity for Phase 3/4 Hooks:**
   - The digital human avatar is packaged into an isolated module (`src/components/avatar/`) with typed state machine interfaces (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `ERROR`).
   - The DOM contains designated `#phase3-digital-human-mount` hooks, ensuring Phase 3 (3D WebRTC video streaming) can be dropped in without redesigning screens.

---

## 2. Directory Layout & Routing Conventions

```
frontend/src/
├── app/
│   ├── (admin)/               <-- Protected administrative dashboard layouts
│   ├── (auth)/                <-- Authentication & login flows
│   ├── (kiosk)/               <-- Primary public touchscreen kiosk route group
│   │   ├── layout.tsx         <-- Kiosk Root Layout (Contexts & Touch Handlers)
│   │   └── kiosk/
│   │       ├── page.tsx                       <-- Main Welcome & Quick Actions Screen
│   │       ├── welcome/page.tsx               <-- Welcome alias route
│   │       ├── assistant/page.tsx             <-- Multimodal Voice & Text Assistant
│   │       ├── visitor-check-in/page.tsx      <-- 2-Step Registration & Thermal Badge
│   │       ├── appointments/page.tsx          <-- Search & Camera QR Scanner Viewport
│   │       ├── directory/page.tsx             <-- Staff Directory & Host Alerting
│   │       ├── employee-directory/page.tsx    <-- Employee Directory Route
│   │       ├── department-navigation/page.tsx <-- Wayfinding & Floor Navigation
│   │       ├── assistance/page.tsx            <-- Concierge Dispatch & Building Amenities
│   │       └── privacy/page.tsx               <-- Security, Sensor Policy & Compliance
│   ├── globals.css            <-- Enterprise design tokens & typography
│   ├── layout.tsx             <-- Root HTML document & viewport meta
│   └── page.tsx               <-- Root splash launcher
├── components/
│   ├── avatar/                <-- Dedicated Avatar Subsystem (Container, Display, Status, Controls)
│   ├── kiosk/                 <-- Kiosk-specific composite organisms (Banner, Actions, Footer)
│   └── ui/                    <-- Reusable atomic design tokens & buttons
├── context/
│   ├── language-context.tsx   <-- Bilingual English/Hindi dictionary provider
│   └── accessibility-context.tsx <-- WCAG High-contrast & font scaling provider
├── hooks/
│   └── use-kiosk-session.ts   <-- Idle detector, timeout warning, & auto-purge
└── services/
    ├── api-client.ts          <-- Central HTTP client (RFC 7807 & Correlation IDs)
    ├── auth-service.ts        <-- Authentication & token rotation
    ├── visitor-service.ts     <-- Visitor check-in & badge contracts
    ├── appointment-service.ts <-- Appointment lookup & QR scanning contracts
    ├── employee-service.ts    <-- Directory search & host arrival alerts
    ├── department-service.ts  <-- Department locations & wayfinding instructions
    └── conversation-service.ts<-- Conversational message dispatch & audio contracts
```

---

## 3. Session Lifecycle & Security Architecture

1. **Inactivity Engine (`useKioskSession`):**
   - Monitors physical touchscreen gestures (`touchstart`, `pointerdown`), keyboard events, and mouse movements.
   - Resets a sliding countdown timer (default 60–90 seconds).
   - In the final 15 seconds, displays a warning countdown dialog ("Resetting due to inactivity in X seconds...").
   - If no interaction occurs, purges all form state and resets navigation to `/kiosk`.
2. **Sensory Device Privacy:**
   - Optical camera sensors and microphone hardware are initialized only on screens requiring user input (Assistant and Appointment QR Scanner).
   - Video streams are processed in local memory and are never persisted or uploaded to public clouds.
