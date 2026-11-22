/**
 * Phase 6: Enterprise RAG Knowledge Base Contract & UI Tests.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_DIR = process.cwd();

test("Phase 6: Enterprise RAG Knowledge Base Integration Tests", async (t) => {
  await t.test("1. Admin Knowledge Management UI Page Contract", () => {
    const pagePath = path.join(
      FRONTEND_DIR,
      "src/app/(admin)/admin/knowledge/page.tsx"
    );
    assert.ok(fs.existsSync(pagePath), "admin/knowledge/page.tsx must exist");

    const content = fs.readFileSync(pagePath, "utf-8");
    assert.match(content, /Enterprise Knowledge Base/);
    assert.match(content, /Semantic Retrieval Verification Sandbox/);
    assert.match(content, /Upload Knowledge Document/);
    assert.match(content, /Total Documents/);
    assert.match(content, /Indexed Chunks/);
    assert.match(content, /handleTestRetrieval/);
    assert.match(content, /handleToggleActive/);
    assert.match(content, /handleReprocess/);
    assert.match(content, /handleDelete/);
  });

  await t.test("2. Admin Navigation Knowledge Base Link", () => {
    const layoutPath = path.join(FRONTEND_DIR, "src/app/(admin)/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    assert.match(content, /\/admin\/knowledge/);
    assert.match(content, /Knowledge Base/);
    assert.match(content, /BookOpen/);
  });

  await t.test("3. Backend RAG Subsystem File Integrity", () => {
    const backendRoot = path.join(FRONTEND_DIR, "..", "backend");
    const requiredFiles = [
      "app/models/knowledge.py",
      "alembic/versions/0002_knowledge_base.py",
      "app/ai/rag/validators.py",
      "app/ai/rag/extractors.py",
      "app/ai/rag/chunker.py",
      "app/ai/rag/embeddings/base.py",
      "app/ai/rag/embeddings/mock_provider.py",
      "app/ai/rag/embeddings/openai_provider.py",
      "app/ai/rag/vector_store.py",
      "app/ai/rag/pipeline.py",
      "app/ai/rag/retriever.py",
      "app/schemas/knowledge.py",
      "app/api/v1/endpoints/knowledge.py",
      "tests/test_rag_knowledge.py",
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.join(backendRoot, relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Backend RAG subsystem file must exist: ${relPath}`
      );
    }
  });

  await t.test("4. Supported Document Format Validation Rules", () => {
    const validatorPath = path.join(
      FRONTEND_DIR,
      "..",
      "backend/app/ai/rag/validators.py"
    );
    const content = fs.readFileSync(validatorPath, "utf-8");

    assert.match(content, /sanitize_filename/);
    assert.match(content, /detect_file_type_and_validate/);
    assert.match(content, /calculate_checksum/);
    assert.match(content, /\.pdf/);
    assert.match(content, /\.docx/);
    assert.match(content, /\.txt/);
    assert.match(content, /\.md/);
  });
});
