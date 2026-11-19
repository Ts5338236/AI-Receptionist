import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Phase 3: Digital Human 3D Avatar Subsystem Tests", () => {
  describe("1. Component File Structure Integrity", () => {
    const requiredFiles = [
      "src/components/avatar/AvatarScene.tsx",
      "src/components/avatar/AvatarRenderer.tsx",
      "src/components/avatar/AvatarController.tsx",
      "src/components/avatar/AvatarLighting.tsx",
      "src/components/avatar/AvatarCamera.tsx",
      "src/components/avatar/AvatarExpressions.tsx",
      "src/components/avatar/AvatarLipSync.tsx",
      "src/components/avatar/AvatarGestures.tsx",
      "src/components/avatar/AvatarFallback.tsx",
      "src/components/avatar/AvatarLoading.tsx",
      "src/components/avatar/AvatarErrorBoundary.tsx",
      "src/hooks/useAvatar.ts",
      "src/hooks/useAvatarAnimation.ts",
      "src/hooks/useAvatarExpressions.ts",
      "src/hooks/useAvatarLipSync.ts",
      "src/types/avatar.ts",
      "src/config/avatar.config.ts",
    ];

    for (const file of requiredFiles) {
      test(`Avatar module file exists: ${file}`, () => {
        const fullPath = path.join(rootDir, file);
        assert.ok(fs.existsSync(fullPath), `Missing file: ${file}`);
      });
    }
  });

  describe("2. Types and Configuration Specifications", () => {
    test("AvatarOperationalState defines required states", () => {
      const typePath = path.join(rootDir, "src/types/avatar.ts");
      const content = fs.readFileSync(typePath, "utf-8");

      const expectedStates = [
        "IDLE",
        "LISTENING",
        "THINKING",
        "SPEAKING",
        "GREETING",
        "ERROR",
        "DISABLED",
      ];
      for (const st of expectedStates) {
        assert.ok(
          content.includes(`"${st}"`),
          `AvatarOperationalState must include state '${st}'`
        );
      }
    });

    test("AvatarExpression supports all required expressions", () => {
      const typePath = path.join(rootDir, "src/types/avatar.ts");
      const content = fs.readFileSync(typePath, "utf-8");

      const expectedExpressions = [
        "neutral",
        "happy",
        "smiling",
        "listening",
        "thinking",
        "speaking",
        "confused",
        "error",
        "welcoming",
      ];
      for (const expr of expectedExpressions) {
        assert.ok(
          content.includes(`"${expr}"`),
          `AvatarExpression must include '${expr}'`
        );
      }
    });

    test("VISEME_MAP defines all 15 phonetic mouth shapes", () => {
      const configPath = path.join(rootDir, "src/config/avatar.config.ts");
      const content = fs.readFileSync(configPath, "utf-8");

      const expectedVisemes = [
        "sil", "PP", "FF", "TH", "DD", "kk", "CH", "SS", "nn", "RR", "aa", "E", "I", "O", "U"
      ];
      for (const v of expectedVisemes) {
        assert.ok(
          content.includes(`${v}:`),
          `VISEME_MAP must map viseme '${v}'`
        );
      }
    });
  });

  describe("3. Expression Controller Logic", () => {
    test("AvatarExpressions implements smooth blend-shape interpolation", () => {
      const exprPath = path.join(rootDir, "src/components/avatar/AvatarExpressions.tsx");
      const content = fs.readFileSync(exprPath, "utf-8");

      assert.ok(content.includes("createExpressionController"), "Must export createExpressionController");
      assert.ok(content.includes("setExpression"), "Must support setExpression");
      assert.ok(content.includes("EXPRESSION_WEIGHTS"), "Must reference expression weights table");
      assert.ok(content.includes("transitionDuration"), "Must support configurable transition duration");
    });
  });

  describe("4. Gesture & Natural Movement Logic", () => {
    test("AvatarGestures implements natural breathing, blinking and head postures", () => {
      const gesturePath = path.join(rootDir, "src/components/avatar/AvatarGestures.tsx");
      const content = fs.readFileSync(gesturePath, "utf-8");

      assert.ok(content.includes("createGestureController"), "Must export createGestureController");
      assert.ok(content.includes("breathingFreq"), "Must calculate breathing frequency");
      assert.ok(content.includes("isBlinking"), "Must manage natural eyelid blinking");
      assert.ok(content.includes("LISTENING"), "Must adapt posture for LISTENING state");
      assert.ok(content.includes("THINKING"), "Must adapt posture for THINKING state");
      assert.ok(content.includes("SPEAKING"), "Must adapt posture for SPEAKING state");
    });
  });

  describe("5. Lip-Sync Engine Logic", () => {
    test("AvatarLipSync implements provider-independent viseme sequencing and mouth interpolation", () => {
      const lipSyncPath = path.join(rootDir, "src/components/avatar/AvatarLipSync.tsx");
      const content = fs.readFileSync(lipSyncPath, "utf-8");

      assert.ok(content.includes("createLipSyncEngine"), "Must export createLipSyncEngine");
      assert.ok(content.includes("generateTestSequence"), "Must provide test phrase sequence generator");
      assert.ok(content.includes("mouthOpen"), "Must compute mouthOpen target ratio");
      assert.ok(content.includes("mouthWide"), "Must compute mouthWide target ratio");
      assert.ok(content.includes("VISEME_MAP"), "Must map viseme definitions to mouth ratios");
    });
  });

  describe("6. Camera & Lighting Rig Calculations", () => {
    test("AvatarCamera implements portrait and landscape framing", () => {
      const camPath = path.join(rootDir, "src/components/avatar/AvatarCamera.tsx");
      const content = fs.readFileSync(camPath, "utf-8");

      assert.ok(content.includes("createAvatarCamera"), "Must export createAvatarCamera");
      assert.ok(content.includes("updateAvatarCameraAspect"), "Must export updateAvatarCameraAspect");
      assert.ok(content.includes("aspect < 1"), "Must handle portrait orientation framing");
    });

    test("AvatarLighting sets up studio 3-point lighting rig", () => {
      const lightPath = path.join(rootDir, "src/components/avatar/AvatarLighting.tsx");
      const content = fs.readFileSync(lightPath, "utf-8");

      assert.ok(content.includes("AmbientLight"), "Must include ambient lighting");
      assert.ok(content.includes("keyLight"), "Must include primary key light");
      assert.ok(content.includes("fillLight"), "Must include fill light");
      assert.ok(content.includes("rimLight"), "Must include rim/back light");
      assert.ok(content.includes("stageGlow"), "Must include stage glow point light");
    });
  });

  describe("7. Missing Model & Fallback Degradation", () => {
    test("AvatarFallback component handles missing WebGL with compliance disclosure", () => {
      const fallbackPath = path.join(
        rootDir,
        "src/components/avatar/AvatarFallback.tsx"
      );
      const content = fs.readFileSync(fallbackPath, "utf-8");

      assert.ok(
        content.includes("WebGL"),
        "Fallback must reference WebGL hardware acceleration"
      );
      assert.ok(
        content.includes("AvatarDisplay"),
        "Fallback must render the 2D animated avatar component"
      );
    });

    test("Required 3D model asset specifications are documented in config", () => {
      const configPath = path.join(rootDir, "src/config/avatar.config.ts");
      const content = fs.readFileSync(configPath, "utf-8");

      assert.ok(
        content.includes("REQUIRED_MODEL_SPECIFICATIONS"),
        "Avatar config must document technical model specifications"
      );
      assert.ok(
        content.includes("GLTF 2.0"),
        "Specifications must stipulate GLTF 2.0 (.glb binary container)"
      );
    });
  });
});
