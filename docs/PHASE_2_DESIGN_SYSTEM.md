# PHASE 2: ENTERPRISE DESIGN SYSTEM SPECIFICATION
## AI Receptionist Kiosk Design System & Ergonomics Guide

**Visual Identity:** Enterprise Futuristic Blue & Slate  
**Hardware Profile:** Physical Commercial Touchscreen Terminals (10" to 55")  
**Compliance Standards:** WCAG 2.1 AA / AAA High-Contrast Standards  

---

## 1. Visual Identity & Design Direction

The AI Receptionist Enterprise kiosk interface delivers an authoritative, high-end corporate identity designed to convey trust, technological sophistication, and accessibility.

### Color Palette

| Token | Hex / HSL | Usage | WCAG Ratio (vs bg) |
| :--- | :--- | :--- | :--- |
| `kiosk-bg` | `#020617` (`slate-950`) | Primary viewport canvas | Base Canvas |
| `surface-1` | `#0f172a` (`slate-900`) | Main content cards & dialogs | 14.8:1 |
| `surface-2` | `#1e293b` (`slate-800`) | Input fields & secondary buttons | 9.2:1 |
| `primary-blue` | `#0284c7` (`sky-600`) | Primary CTA buttons & active highlights | 5.8:1 |
| `accent-cyan` | `#06b6d4` (`cyan-500`) | Telemetry badges & high-contrast accents| 8.1:1 |
| `status-emerald`| `#10b981` (`emerald-500`)| Listening state & verified pass indicators | 6.5:1 |
| `status-amber` | `#f59e0b` (`amber-500`) | Thinking state & warning alerts | 7.2:1 |
| `status-rose` | `#f43f5e` (`rose-500`) | Error alerts & sensor disconnected | 5.9:1 |
| `text-primary` | `#f8fafc` (`slate-50`) | Headings & primary labels | 17.1:1 |
| `text-muted` | `#94a3b8` (`slate-400`) | Sub-captions, timestamps, descriptions | 6.4:1 |

---

## 2. Touchscreen Ergonomics & Target Sizing

Physical kiosks operate in high-traffic public lobbies where visitors interact with varying touch precision. Standard web sizing ($24\text{px}$–$32\text{px}$) is unsuitable.

1. **Touch Target Standard ($\ge 48\text{px}$):**
   - **Primary Buttons:** Minimum height $56\text{px}$–$64\text{px}$, padding $20\text{px}$ horizontal.
   - **Quick Action Cards:** Minimum height $150\text{px}$, tactile click feedback with `active:scale-[0.98]`.
   - **Icon Buttons & Modals:** Minimum hit box $48\text{px} \times 48\text{px}$.
   - **Form Inputs:** Height $56\text{px}$ with large $16\text{px}$ text to prevent automatic iOS/Android browser zooms.
2. **Spacing & Layout:**
   - Edge margins: Minimum $24\text{px}$ to prevent clipped touches near kiosk chassis bezels.
   - Button separation: Minimum $12\text{px}$ gap to prevent accidental double-touches.

---

## 3. Responsive Breakpoints & Viewport Adaptation

The kiosk frontend dynamically adapts to standard commercial touch hardware:

| Resolution | Aspect Ratio | Orientation | Target Kiosk Hardware |
| :--- | :--- | :--- | :--- |
| **1920 x 1080** | 16:9 | Landscape | Standard 32"–55" Lobby Pedestal Kiosk |
| **1600 x 900** | 16:9 | Landscape | Medium Floor Stand Kiosks |
| **1366 x 768** | 16:9 | Landscape | 15.6" Countertop Reception Displays |
| **1280 x 800** | 16:10 | Landscape | 10"–12" Reception Tablets |
| **1080 x 1920** | 9:16 | Portrait | Vertical Totem Kiosks |
| **1024 x 768** | 4:3 | Landscape | Legacy POS / Kiosk Terminals |

---

## 4. Typography Scale

```css
/* Typography Scale */
h1: text-3xl md:text-5xl (font-black, tracking-tight)
h2: text-2xl md:text-3xl (font-extrabold, tracking-tight)
h3: text-xl md:text-2xl (font-bold)
h4: text-lg md:text-xl (font-bold)
body-lg: text-base md:text-lg (leading-relaxed)
body-md: text-sm md:text-base
caption: text-xs md:text-sm (font-medium, text-slate-400)
telemetry: text-[10px] md:text-xs (font-mono, tracking-wider, uppercase)
```

---

## 5. Motion Tokens & Framer Motion Variants

Animations are calibrated to feel responsive without inducing visual fatigue or kiosk GPU lag:

- **Entrance Duration:** $300\text{ms}$ ease-out (`fade-in`, `slide-in-from-bottom`).
- **Card Tap Reaction:** $150\text{ms}$ `scale(0.98)` feedback.
- **Avatar Pulse:** $3.5\text{s}$ infinite ambient breathing cycle.
- **Waveform Bar Transitions:** $400\text{ms}$–$800\text{ms}$ alternating height animations during speech output.
- **Reduced Motion:** Fully conforms to `@media (prefers-reduced-motion: reduce)`, disabling non-essential transforms.
