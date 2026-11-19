import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("AI Receptionist Kiosk - Complete Frontend Contract & Integrity Tests", () => {
  describe("1. Kiosk Routes Integrity", () => {
    const requiredKioskRoutes = [
      "src/app/(kiosk)/layout.tsx",
      "src/app/(kiosk)/kiosk/page.tsx",
      "src/app/(kiosk)/kiosk/welcome/page.tsx",
      "src/app/(kiosk)/kiosk/assistant/page.tsx",
      "src/app/(kiosk)/kiosk/visitor-check-in/page.tsx",
      "src/app/(kiosk)/kiosk/appointments/page.tsx",
      "src/app/(kiosk)/kiosk/directory/page.tsx",
      "src/app/(kiosk)/kiosk/employee-directory/page.tsx",
      "src/app/(kiosk)/kiosk/department-navigation/page.tsx",
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

  describe("2. Modular Avatar Subsystem", () => {
    const avatarFiles = [
      "src/components/avatar/AvatarTypes.ts",
      "src/components/avatar/AvatarContainer.tsx",
      "src/components/avatar/AvatarDisplay.tsx",
      "src/components/avatar/AvatarStatus.tsx",
      "src/components/avatar/AvatarControls.tsx",
      "src/components/avatar/AvatarAnimations.tsx",
    ];

    for (const file of avatarFiles) {
      test(`Avatar module exists: ${file}`, () => {
        const fullPath = path.join(rootDir, file);
        assert.ok(fs.existsSync(fullPath), `Avatar file missing: ${file}`);
      });
    }

    test("AvatarState supports 5 explicit operational states: IDLE, LISTENING, THINKING, SPEAKING, ERROR", () => {
      const typeFile = path.join(
        rootDir,
        "src/components/avatar/AvatarTypes.ts"
      );
      const content = fs.readFileSync(typeFile, "utf-8");

      const expectedStates = [
        "IDLE",
        "LISTENING",
        "THINKING",
        "SPEAKING",
        "ERROR",
      ];
      for (const st of expectedStates) {
        assert.ok(
          content.includes(`"${st}"`),
          `AvatarTypes must include state '${st}'`
        );
      }
    });
  });

  describe("3. Reusable UI Design Token Components", () => {
    const uiComponents = [
      "src/components/ui/PrimaryButton.tsx",
      "src/components/ui/SecondaryButton.tsx",
      "src/components/ui/IconButton.tsx",
      "src/components/ui/ActionCard.tsx",
      "src/components/ui/Modal.tsx",
      "src/components/ui/Drawer.tsx",
      "src/components/ui/Dialog.tsx",
      "src/components/ui/Toast.tsx",
      "src/components/ui/LoadingIndicator.tsx",
      "src/components/ui/ErrorState.tsx",
      "src/components/ui/EmptyState.tsx",
      "src/components/ui/LanguageSelector.tsx",
      "src/components/ui/AccessibilityToolbar.tsx",
      "src/components/ui/KioskHeader.tsx",
      "src/components/ui/KioskFooter.tsx",
    ];

    for (const comp of uiComponents) {
      test(`UI Component exists: ${comp}`, () => {
        const fullPath = path.join(rootDir, comp);
        assert.ok(fs.existsSync(fullPath), `Component file missing: ${comp}`);
      });
    }
  });

  describe("4. Typed API Services", () => {
    const services = [
      "src/services/api-client.ts",
      "src/services/auth-service.ts",
      "src/services/visitor-service.ts",
      "src/services/appointment-service.ts",
      "src/services/employee-service.ts",
      "src/services/department-service.ts",
      "src/services/conversation-service.ts",
    ];

    for (const s of services) {
      test(`Service exists: ${s}`, () => {
        const fullPath = path.join(rootDir, s);
        assert.ok(fs.existsSync(fullPath), `Service file missing: ${s}`);
      });
    }
  });

  describe("5. Touchscreen Quick Actions Grid", () => {
    test("QuickActions component implements 6 primary touch cards", () => {
      const actionsFile = path.join(
        rootDir,
        "src/components/kiosk/quick-actions.tsx"
      );
      const content = fs.readFileSync(actionsFile, "utf-8");

      const expectedActions = [
        "/kiosk/visitor-check-in",
        "/kiosk/appointments",
        "/kiosk/employee-directory",
        "/kiosk/department-navigation",
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

  describe("6. Localization System (English & Hindi)", () => {
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

  describe("7. Accessibility & Inactivity Reset", () => {
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
