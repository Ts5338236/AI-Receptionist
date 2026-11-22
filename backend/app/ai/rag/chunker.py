"""Configurable, token-bounded document chunker preserving section and page metadata."""

import re
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from app.ai.rag.extractors import ExtractedPage


class DocumentChunkItem(BaseModel):
    """Individual chunk ready for vectorization and indexing."""

    chunk_index: int
    content: str
    token_count: int
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    metadata: Dict[str, Any] = {}


class DocumentChunker:
    """
    Splits extracted pages/sections into token-bounded chunks.
    Preserves heading context, paragraph boundaries, and page references.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Approximates token count (~4 characters per token)."""
        return max(1, len(text) // 4)

    def chunk_pages(
        self,
        pages: List[ExtractedPage],
        document_title: str = "",
    ) -> List[DocumentChunkItem]:
        """Processes extracted pages into ordered, overlap-bounded chunks."""
        chunks: List[DocumentChunkItem] = []
        global_chunk_idx = 0

        current_section = document_title

        for page in pages:
            if page.is_empty or not page.text:
                continue

            # Split page text into paragraphs or section blocks
            paragraphs = re.split(r"\n\s*\n", page.text)

            current_chunk_text = ""

            for para in paragraphs:
                clean_para = para.strip()
                if not clean_para:
                    continue

                # Detect markdown-style headings
                if clean_para.startswith("#"):
                    heading_match = re.match(r"^#{1,6}\s*(.+)$", clean_para, re.MULTILINE)
                    if heading_match:
                        current_section = heading_match.group(1).strip()

                # If adding paragraph exceeds chunk_size, flush existing chunk
                if current_chunk_text and (len(current_chunk_text) + len(clean_para) > self.chunk_size):
                    token_count = self.estimate_tokens(current_chunk_text)
                    chunks.append(
                        DocumentChunkItem(
                            chunk_index=global_chunk_idx,
                            content=current_chunk_text.strip(),
                            token_count=token_count,
                            page_number=page.page_number,
                            section_title=current_section,
                            metadata={
                                "page": page.page_number,
                                "section": current_section,
                                "document_title": document_title,
                            },
                        )
                    )
                    global_chunk_idx += 1

                    # Retain overlap from end of current_chunk_text
                    if self.chunk_overlap > 0 and len(current_chunk_text) > self.chunk_overlap:
                        current_chunk_text = current_chunk_text[-self.chunk_overlap :] + "\n" + clean_para
                    else:
                        current_chunk_text = clean_para
                else:
                    if current_chunk_text:
                        current_chunk_text += "\n\n" + clean_para
                    else:
                        current_chunk_text = clean_para

            # Flush remaining text on page
            if current_chunk_text.strip():
                token_count = self.estimate_tokens(current_chunk_text)
                chunks.append(
                    DocumentChunkItem(
                        chunk_index=global_chunk_idx,
                        content=current_chunk_text.strip(),
                        token_count=token_count,
                        page_number=page.page_number,
                        section_title=current_section,
                        metadata={
                            "page": page.page_number,
                            "section": current_section,
                            "document_title": document_title,
                        },
                    )
                )
                global_chunk_idx += 1

        return chunks
