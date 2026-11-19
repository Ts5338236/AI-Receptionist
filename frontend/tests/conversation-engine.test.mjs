/**
 * Phase 5: AI Conversation Engine & LangGraph Integration Contract Tests.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_DIR = process.cwd();

test("Phase 5: Conversational AI & LangGraph Engine Integration Tests", async (t) => {
  await t.test("1. Conversation Service API Contract", () => {
    const servicePath = path.join(FRONTEND_DIR, "src/services/conversation-service.ts");
    assert.ok(fs.existsSync(servicePath), "conversation-service.ts must exist");

    const content = fs.readFileSync(servicePath, "utf-8");
    assert.match(content, /getOrCreateConversation/);
    assert.match(content, /sendMessage/);
    assert.match(content, /resetConversation/);
    assert.match(content, /endConversation/);
    assert.match(content, /\/conversations/);
  });

  await t.test("2. Backend AI Subsystem File Integrity", () => {
    const backendRoot = path.join(FRONTEND_DIR, "..", "backend");
    const requiredFiles = [
      "app/ai/schemas/intent.py",
      "app/ai/schemas/conversation.py",
      "app/ai/prompts/system.py",
      "app/ai/prompts/receptionist.py",
      "app/ai/prompts/intent.py",
      "app/ai/providers/base.py",
      "app/ai/providers/openai_provider.py",
      "app/ai/providers/mock_provider.py",
      "app/ai/tools/base.py",
      "app/ai/tools/registry.py",
      "app/ai/graph/state.py",
      "app/ai/graph/workflow.py",
      "app/ai/memory/session_memory.py",
      "app/ai/rag/retriever.py",
      "app/api/v1/endpoints/conversations.py",
      "tests/test_conversation_engine.py",
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.join(backendRoot, relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Backend AI subsystem file must exist: ${relPath}`
      );
    }
  });

  await t.test("3. Assistant Page Conversation Integration", () => {
    const assistantPage = path.join(
      FRONTEND_DIR,
      "src/app/(kiosk)/kiosk/assistant/page.tsx"
    );
    const content = fs.readFileSync(assistantPage, "utf-8");

    assert.match(content, /conversationService\.sendMessage/);
    assert.match(content, /handleRestartConversation/);
    assert.match(content, /useVoiceClient/);
    assert.match(content, /AvatarStage/);
  });
});
