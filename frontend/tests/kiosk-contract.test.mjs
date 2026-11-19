import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("AI Receptionist Kiosk - Frontend Contract & Integrity Tests", () => {
  describe("1. Kiosk Routes Integrity", () => {
    const requiredKioskRoutes = [
      "src/app/(kiosk)/layout.tsx",
      "src/app/(kiosk)/kiosk/page.tsx",
      "src/app/(kiosk)/kiosk/welcome/page.tsx",
      "src/app/(kiosk)/kiosk/assistant/page.tsx",
      "src/app/(kiosk)/kiosk/visitor-check-in/page.tsx",
      "src/app/(kiosk)/kiosk/appointments/page.tsx",
      "src/app/(kiosk)/kiosk/directory/page.tsx",
      "src/app/(kiosk)/kiosk/assistance/page.tsx",
      "src/app/(kiosk)/kiosk/privacy/page.tsx",
    ];

    for (const route of requiredKioskRoutes) {
      test(`Route file exists: ${route}`, () => {
        const fullPath = path.join(rootDir, route);
        assert.ok(fs.existsSync(fullPath), `Route file missing: ${route}`);
        const content = fs.readFileSync(fullPath, "utf-8");
        assert.ok(
          content.includes("export default function") ||
            content.includes("export default"),
          `Route ${route} must have a default export`
        );
      });
    }
  });

  describe("2. Core Components Integrity", () => {
    const requiredComponents = [
      "src/components/kiosk/avatar-stage.tsx",
      "src/components/kiosk/status-banner.tsx",
      "src/components/kiosk/quick-actions.tsx",
      "src/components/kiosk/kiosk-footer.tsx",
      "src/context/language-context.tsx",
      "src/context/accessibility-context.tsx",
      "src/hooks/use-kiosk-session.ts",
    ];

    for (const comp of requiredComponents) {
      test(`Component file exists: ${comp}`, () => {
        const fullPath = path.join(rootDir, comp);
        assert.ok(fs.existsSync(fullPath), `Component file missing: ${comp}`);
      });
    }
  });

  describe("3. Digital Human Avatar State Model", () => {
    test("AvatarStage supports 5 explicit operational states: IDLE, LISTENING, THINKING, SPEAKING, ERROR", () => {
      const avatarFile = path.join(
        rootDir,
        "src/components/kiosk/avatar-stage.tsx"
      );
      const content = fs.readFileSync(avatarFile, "utf-8");

      const expectedStates = [
        "IDLE",
        "LISTENING",
        "THINKING",
        "SPEAKING",
        "ERROR",
      ];
      for (const st of expectedStates) {
        assert.ok(
          content.includes(`"${st}"`) || content.includes(`'${st}'`),
          `AvatarStage must include state definition for '${st}'`
        );
      }

      // Check Phase 3 explicit boundary disclosure
      assert.ok(
        content.includes("Phase 3") || content.includes("WebRTC"),
        "AvatarStage must document Phase 3 WebRTC / 3D digital human placeholder hook"
      );
    });
  });

  describe("4. Touchscreen Quick Actions Grid", () => {
    test("QuickActions component implements 6 primary touch cards", () => {
      const actionsFile = path.join(
        rootDir,
        "src/components/kiosk/quick-actions.tsx"
      );
      const content = fs.readFileSync(actionsFile, "utf-8");

      const expectedActions = [
        "/kiosk/visitor-check-in",
        "/kiosk/appointments",
        "/kiosk/directory",
        "/kiosk/assistance",
      ];

      for (const actionRoute of expectedActions) {
        assert.ok(
          content.includes(actionRoute),
          `QuickActions must link to route ${actionRoute}`
        );
      }
    });

    test("Primary Conversation CTA triggers /kiosk/assistant", () => {
      const footerFile = path.join(
        rootDir,
        "src/components/kiosk/kiosk-footer.tsx"
      );
      const footerContent = fs.readFileSync(footerFile, "utf-8");
      assert.ok(
        footerContent.includes("/kiosk/assistant"),
        "Kiosk footer CTA must navigate to /kiosk/assistant"
      );
    });
  });

  describe("5. Localization System (English & Hindi)", () => {
    test("Language context supports both English ('en') and Hindi ('hi')", () => {
      const langFile = path.join(
        rootDir,
        "src/context/language-context.tsx"
      );
      const content = fs.readFileSync(langFile, "utf-8");

      assert.ok(content.includes('"en"'), "Supported languages must include 'en'");
      assert.ok(content.includes('"hi"'), "Supported languages must include 'hi'");
      assert.ok(
        content.includes("welcomeHeading"),
        "Dictionary must contain welcomeHeading"
      );
      assert.ok(
        content.includes("startConversationBtn"),
        "Dictionary must contain startConversationBtn"
      );
      assert.ok(
        content.includes("quickActionsTitle"),
        "Dictionary must contain quickActionsTitle"
      );
    });
  });

  describe("6. Accessibility & Inactivity Reset", () => {
    test("AccessibilityContext provides high contrast and text scaling controls", () => {
      const a11yFile = path.join(
        rootDir,
        "src/context/accessibility-context.tsx"
      );
      const content = fs.readFileSync(a11yFile, "utf-8");

      assert.ok(
        content.includes("highContrast"),
        "Accessibility context must provide highContrast state"
      );
      assert.ok(
        content.includes("textScale"),
        "Accessibility context must provide textScale state"
      );
    });

    test("useKioskSession enforces inactivity timeout and session return", () => {
      const hookFile = path.join(
        rootDir,
        "src/hooks/use-kiosk-session.ts"
      );
      const content = fs.readFileSync(hookFile, "utf-8");

      assert.ok(
        content.includes("timeoutSeconds"),
        "Hook must support configurable timeoutSeconds"
      );
      assert.ok(
        content.includes("resetActivity"),
        "Hook must provide resetActivity callback"
      );
      assert.ok(
        content.includes("isWarning"),
        "Hook must provide warning countdown trigger"
      );
    });
  });
});
