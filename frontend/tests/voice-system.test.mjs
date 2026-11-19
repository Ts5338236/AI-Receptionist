/**
 * Phase 4: Voice Infrastructure & Real-Time Audio Protocol Contract Tests.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_DIR = process.cwd();

test("Phase 4: Real-Time Voice Infrastructure Subsystem Tests", async (t) => {
  await t.test("1. Voice Module File Structure Integrity", () => {
    const requiredFiles = [
      "src/types/voice.ts",
      "src/hooks/useAudioCapture.ts",
      "src/hooks/useAudioPlayback.ts",
      "src/hooks/useVoiceClient.ts",
      "src/app/(kiosk)/kiosk/assistant/page.tsx",
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.join(FRONTEND_DIR, relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Voice system required file must exist: ${relPath}`
      );
    }
  });

  await t.test("2. Voice Protocol and Event Types Definition", () => {
    const typesPath = path.join(FRONTEND_DIR, "src/types/voice.ts");
    const content = fs.readFileSync(typesPath, "utf-8");

    // Client Events
    assert.match(content, /"voice\.start"/);
    assert.match(content, /"audio\.chunk"/);
    assert.match(content, /"voice\.stop"/);
    assert.match(content, /"voice\.cancel"/);
    assert.match(content, /"voice\.ping"/);

    // Server Events
    assert.match(content, /"voice\.ready"/);
    assert.match(content, /"transcript\.partial"/);
    assert.match(content, /"transcript\.final"/);
    assert.match(content, /"speech\.started"/);
    assert.match(content, /"speech\.audio_chunk"/);
    assert.match(content, /"speech\.completed"/);
    assert.match(content, /"voice\.error"/);

    // Viseme and payload models
    assert.match(content, /interface VisemeTimingFrame/);
    assert.match(content, /interface SpeechAudioChunkPayload/);
    assert.match(content, /interface TranscriptPayload/);
  });

  await t.test("3. Browser Audio Capture & VAD Contract", () => {
    const hookPath = path.join(FRONTEND_DIR, "src/hooks/useAudioCapture.ts");
    const content = fs.readFileSync(hookPath, "utf-8");

    assert.match(content, /navigator\.mediaDevices\.getUserMedia/);
    assert.match(content, /MediaRecorder/);
    assert.match(content, /createAnalyser/);
    assert.match(content, /silenceTimeoutMs/);
    assert.match(content, /maxRecordingMs/);
    assert.match(content, /onAudioChunk/);
    assert.match(content, /onSilenceDetected/);
    assert.match(content, /permissionState/);
    assert.match(content, /toggleMute/);
  });

  await t.test("4. Web Audio Playback & Barge-In Queue Contract", () => {
    const hookPath = path.join(FRONTEND_DIR, "src/hooks/useAudioPlayback.ts");
    const content = fs.readFileSync(hookPath, "utf-8");

    assert.match(content, /AudioContext/);
    assert.match(content, /decodeAudioData/);
    assert.match(content, /createBufferSource/);
    assert.match(content, /queueAudioChunk/);
    assert.match(content, /nextStartTimeRef/);
    assert.match(content, /stop/); // For barge-in interruption
  });

  await t.test("5. Voice Client & Avatar Synchronization Contract", () => {
    const hookPath = path.join(FRONTEND_DIR, "src/hooks/useVoiceClient.ts");
    const content = fs.readFileSync(hookPath, "utf-8");

    // WebSocket transport
    assert.match(content, /new WebSocket/);
    assert.match(content, /sendClientEvent/);
    assert.match(content, /handleServerMessage/);

    // Avatar state transitions
    assert.match(content, /setState\("SPEAKING"\)/);
    assert.match(content, /setState\("LISTENING"\)/);
    assert.match(content, /setState\("THINKING"\)/);
    assert.match(content, /setState\("IDLE"\)/);
    assert.match(content, /setState\("ERROR"\)/);

    // Lip-sync integration
    assert.match(content, /startLipSync/);

    // Barge-in / interruption
    assert.match(content, /barge_in/);
    assert.match(content, /voice\.cancel/);
  });

  await t.test("6. Assistant Page Voice & UI Integration", () => {
    const pagePath = path.join(
      FRONTEND_DIR,
      "src/app/(kiosk)/kiosk/assistant/page.tsx"
    );
    const content = fs.readFileSync(pagePath, "utf-8");

    assert.match(content, /useVoiceClient/);
    assert.match(content, /computedAvatarState/);
    assert.match(content, /handleToggleMic/);
    assert.match(content, /partialTranscript/);
    assert.match(content, /Tap to Interrupt \/ Barge-in/);
  });
});
