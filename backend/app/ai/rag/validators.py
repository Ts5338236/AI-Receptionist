"""Enterprise Document Validation Service for Phase 6 RAG."""

import hashlib
import os
import re
from typing import Tuple

from app.core.config import settings


class DocumentValidationError(Exception):
    """Raised when an uploaded document fails security, format, or integrity checks."""

    pass


SUPPORTED_MIME_TYPES = {
    "pdf": ["application/pdf"],
    "docx": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/zip",  # docx is a zipped XML package
    ],
    "txt": ["text/plain"],
    "md": ["text/markdown", "text/plain", "text/x-markdown"],
}

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


def sanitize_filename(filename: str) -> str:
    """Strips directory traversal sequences and unsafe characters from filenames."""
    # Remove directory separators and null bytes
    clean = os.path.basename(filename.strip().replace("\x00", ""))
    # Remove potentially dangerous characters, allowing alphanumeric, dots, underscores, hyphens, and spaces
    clean = re.sub(r"[^\w\s\.-]", "_", clean)
    if not clean or clean.startswith("."):
        clean = f"document_{clean.lstrip('.')}"
    return clean[:255]


def calculate_checksum(content: bytes) -> str:
    """Calculates SHA-256 checksum of raw file bytes for deduplication."""
    return hashlib.sha256(content).hexdigest()


def detect_file_type_and_validate(
    filename: str,
    content: bytes,
    content_type: str = "",
) -> Tuple[str, str]:
    """
    Validates file size, extension, MIME type, and magic bytes.
    Returns (detected_extension, validated_mime_type).
    """
    # 1. Size Check
    if not content or len(content) == 0:
        raise DocumentValidationError("Uploaded document is completely empty (0 bytes).")

    if len(content) > settings.MAX_DOCUMENT_SIZE_BYTES:
        raise DocumentValidationError(
            f"File size exceeds maximum permitted limit ({settings.MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024):.1f} MB)."
        )

    # 2. Extension Check
    _, ext = os.path.splitext(filename.lower())
    if ext not in SUPPORTED_EXTENSIONS:
        raise DocumentValidationError(
            f"Unsupported file extension '{ext}'. Supported formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    file_format = ext.lstrip(".")

    # 3. Magic Header & Content Check
    if file_format == "pdf":
        if not content.startswith(b"%PDF-"):
            raise DocumentValidationError("Invalid PDF: File does not start with standard '%PDF-' magic header.")
        validated_mime = "application/pdf"

    elif file_format == "docx":
        # DOCX files are ZIP archives starting with PK\x03\x04
        if not content.startswith(b"PK\x03\x04"):
            raise DocumentValidationError("Invalid DOCX: File does not have valid ZIP / OpenXML package header.")
        validated_mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    elif file_format in ("txt", "md"):
        # Ensure file is valid text decodable
        try:
            content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                content.decode("latin-1")
            except Exception:
                raise DocumentValidationError(f"Invalid text file: unable to decode {file_format.upper()} content.")

        validated_mime = "text/plain" if file_format == "txt" else "text/markdown"

    else:
        raise DocumentValidationError(f"Unrecognized format '{file_format}'.")

    return file_format, validated_mime
