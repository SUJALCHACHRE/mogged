"""PDF text extraction using pypdf."""

import io
from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text content from a PDF file."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts).strip()


def extract_text_from_path(path: str) -> str:
    """Extract text from a PDF file path."""
    reader = PdfReader(path)
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts).strip()
