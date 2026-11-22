"""Document text extraction adapters for PDF, DOCX, TXT, and Markdown."""

import io
from abc import ABC, abstractmethod
from typing import Any, Dict, List

from pydantic import BaseModel


class ExtractedPage(BaseModel):
    """Page-level or section-level text extraction record."""

    page_number: int
    text: str
    is_empty: bool = False
    metadata: Dict[str, Any] = {}


class ExtractionResult(BaseModel):
    """Consolidated document extraction output."""

    pages: List[ExtractedPage]
    total_characters: int
    scanned_image_detected: bool = False
    detected_format: str


class DocumentExtractor(ABC):
    """Abstract interface for format-specific text extractors."""

    @abstractmethod
    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        """Extracts text content and page/section hierarchy."""
        pass


class PDFExtractor(DocumentExtractor):
    """Extracts text page-by-page from PDF files using pypdf."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        import pypdf

        reader = pypdf.PdfReader(io.BytesIO(content))
        pages: List[ExtractedPage] = []
        total_chars = 0
        total_pages = len(reader.pages)
        empty_page_count = 0

        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            page_text_clean = page_text.strip()
            is_empty = len(page_text_clean) == 0

            if is_empty:
                empty_page_count += 1

            total_chars += len(page_text_clean)
            pages.append(
                ExtractedPage(
                    page_number=idx + 1,
                    text=page_text_clean,
                    is_empty=is_empty,
                    metadata={"page_index": idx, "char_count": len(page_text_clean)},
                )
            )

        # Scanned PDF detection: if multiple pages exist and text is negligible (or 0) across all pages
        scanned_detected = (total_pages > 0 and total_chars < 50) or (
            total_pages > 1 and empty_page_count == total_pages
        )

        return ExtractionResult(
            pages=pages,
            total_characters=total_chars,
            scanned_image_detected=scanned_detected,
            detected_format="pdf",
        )


class DOCXExtractor(DocumentExtractor):
    """Extracts structured text from Microsoft Word .docx files."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        import docx

        doc = docx.Document(io.BytesIO(content))
        paragraphs: List[str] = []

        # Extract paragraphs with heading markers
        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                if p.style and "Heading" in p.style.name:
                    paragraphs.append(f"\n### {text}\n")
                else:
                    paragraphs.append(text)

        # Extract table cells
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    paragraphs.append(" | ".join(row_cells))

        full_text = "\n\n".join(paragraphs).strip()
        total_chars = len(full_text)

        page = ExtractedPage(
            page_number=1,
            text=full_text,
            is_empty=(total_chars == 0),
            metadata={"paragraph_count": len(paragraphs)},
        )

        return ExtractionResult(
            pages=[page],
            total_characters=total_chars,
            scanned_image_detected=False,
            detected_format="docx",
        )


class TextExtractor(DocumentExtractor):
    """Extracts raw plain text or Markdown with structure."""

    def __init__(self, is_markdown: bool = False):
        self.is_markdown = is_markdown

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1", errors="replace")

        clean_text = text.strip()
        total_chars = len(clean_text)

        page = ExtractedPage(
            page_number=1,
            text=clean_text,
            is_empty=(total_chars == 0),
            metadata={"format": "markdown" if self.is_markdown else "txt"},
        )

        return ExtractionResult(
            pages=[page],
            total_characters=total_chars,
            scanned_image_detected=False,
            detected_format="md" if self.is_markdown else "txt",
        )


def get_extractor_for_format(file_format: str) -> DocumentExtractor:
    """Factory returning the appropriate extractor adapter for a file format."""
    fmt = file_format.lower().lstrip(".")
    if fmt == "pdf":
        return PDFExtractor()
    elif fmt == "docx":
        return DOCXExtractor()
    elif fmt == "md":
        return TextExtractor(is_markdown=True)
    elif fmt == "txt":
        return TextExtractor(is_markdown=False)
    else:
        raise ValueError(f"No extractor registered for document format '{fmt}'.")
