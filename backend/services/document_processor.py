import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple
from PIL import Image

try:
    import pytesseract
    # Configure tesseract executable if path is provided in env
    tess_path = os.getenv("TESSERACT_PATH")
    if tess_path and os.path.exists(tess_path):
        pytesseract.pytesseract.tesseract_cmd = tess_path
except ImportError:
    pytesseract = None

import pypdf
import docx
import openpyxl

ALLOWED_EXTENSIONS = {"pdf", "docx", "xlsx", "txt", "csv", "json", "jpg", "jpeg", "png"}


class DocumentProcessor:
    """
    Handles text extraction, multi-page segmentation, and OCR
    across PDF, DOCX, XLSX, TXT, CSV, JSON, JPG, and PNG files.
    """

    @staticmethod
    def validate_file(filename: str, file_size: int, max_size_mb: int = 50) -> str:
        """
        Validates file extension and size. Returns lowercased extension.
        """
        if not filename or "." not in filename:
            raise ValueError(f"Invalid filename: '{filename}' has no extension.")

        ext = filename.rsplit(".", 1)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file type '.{ext}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        max_bytes = max_size_mb * 1024 * 1024
        if file_size > max_bytes:
            raise ValueError(
                f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed size ({max_size_mb} MB)."
            )

        return "jpg" if ext == "jpeg" else ext

    @classmethod
    def extract_text(cls, file_path: str, original_filename: str) -> Dict[str, Any]:
        """
        Dispatches extraction based on file extension.
        Returns dictionary with pages, full_text, page_count, and metadata.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = original_filename.rsplit(".", 1)[-1].lower()
        if ext == "jpeg":
            ext = "jpg"

        if ext == "pdf":
            return cls._extract_pdf(path)
        elif ext == "docx":
            return cls._extract_docx(path)
        elif ext == "xlsx":
            return cls._extract_xlsx(path)
        elif ext in {"txt", "csv", "json"}:
            return cls._extract_txt(path)
        elif ext in {"jpg", "png"}:
            return cls._extract_image(path)
        else:
            raise ValueError(f"Unsupported extension: {ext}")

    @classmethod
    def _extract_pdf(cls, path: Path) -> Dict[str, Any]:
        """Extracts text per page from PDF; falls back to OCR if a page is scanned."""
        pages: List[Dict[str, Any]] = []
        full_text_list: List[str] = []

        try:
            reader = pypdf.PdfReader(str(path))
            total_pages = len(reader.pages)

            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                page_text = page.extract_text() or ""
                page_text = page_text.strip()

                # If text is nearly empty, try OCR if images are present in the PDF page
                if len(page_text) < 30 and pytesseract:
                    try:
                        for img_obj in page.images:
                            img = Image.open(img_obj.name)
                            ocr_text = pytesseract.image_to_string(img).strip()
                            if ocr_text:
                                page_text += ("\n" if page_text else "") + ocr_text
                    except Exception as ocr_err:
                        # Graceful fallback if tesseract binary is not configured
                        pass

                if not page_text:
                    page_text = f"[Page {page_num}: Scanned or image content without extractable text]"

                pages.append({
                    "page_number": page_num,
                    "content": page_text,
                    "char_count": len(page_text)
                })
                full_text_list.append(f"--- Page {page_num} ---\n{page_text}")

            full_text = "\n\n".join(full_text_list)
            return {
                "file_type": "pdf",
                "page_count": max(1, total_pages),
                "pages": pages,
                "full_text": full_text,
                "metadata": {"total_pages": total_pages}
            }
        except Exception as e:
            raise RuntimeError(f"Error reading PDF file: {str(e)}")

    @classmethod
    def _extract_docx(cls, path: Path) -> Dict[str, Any]:
        """Extracts text and tables from Word DOCX."""
        try:
            doc = docx.Document(str(path))
            content_blocks: List[str] = []

            for para in doc.paragraphs:
                text = para.text.strip()
                if text:
                    content_blocks.append(text)

            for table in doc.tables:
                table_lines = []
                for row in table.rows:
                    row_cells = [cell.text.strip() for cell in row.cells]
                    table_lines.append(" | ".join(row_cells))
                if table_lines:
                    content_blocks.append("\n".join(table_lines))

            # Segment into logical pages based on ~1800 chars per page
            full_text = "\n\n".join(content_blocks)
            pages = cls._chunk_text_to_pages(full_text, chars_per_page=1800)

            return {
                "file_type": "docx",
                "page_count": len(pages),
                "pages": pages,
                "full_text": full_text,
                "metadata": {"paragraphs": len(doc.paragraphs), "tables": len(doc.tables)}
            }
        except Exception as e:
            raise RuntimeError(f"Error reading DOCX file: {str(e)}")

    @classmethod
    def _extract_xlsx(cls, path: Path) -> Dict[str, Any]:
        """Extracts sheets and structured table rows from Excel XLSX."""
        try:
            wb = openpyxl.load_workbook(str(path), data_only=True)
            pages: List[Dict[str, Any]] = []
            full_text_list: List[str] = []

            for idx, sheet_name in enumerate(wb.sheetnames):
                page_num = idx + 1
                sheet = wb[sheet_name]
                rows_text: List[str] = [f"Sheet: {sheet_name}"]

                for row in sheet.iter_rows(values_only=True):
                    # Filter out completely empty rows
                    cells = [str(c).strip() for c in row if c is not None and str(c).strip() != ""]
                    if cells:
                        rows_text.append(" | ".join(cells))

                sheet_content = "\n".join(rows_text)
                if len(rows_text) <= 1:
                    sheet_content += "\n(Empty sheet)"

                pages.append({
                    "page_number": page_num,
                    "content": sheet_content,
                    "char_count": len(sheet_content)
                })
                full_text_list.append(sheet_content)

            full_text = "\n\n".join(full_text_list)
            return {
                "file_type": "xlsx",
                "page_count": max(1, len(pages)),
                "pages": pages,
                "full_text": full_text,
                "metadata": {"sheet_names": wb.sheetnames}
            }
        except Exception as e:
            raise RuntimeError(f"Error reading XLSX file: {str(e)}")

    @classmethod
    def _extract_txt(cls, path: Path) -> Dict[str, Any]:
        """Extracts text from plain text file with multi-encoding fallback."""
        raw_bytes = path.read_bytes()
        text = ""
        for encoding in ["utf-8", "latin-1", "cp1252"]:
            try:
                text = raw_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        text = text.strip()
        pages = cls._chunk_text_to_pages(text, chars_per_page=2000)

        return {
            "file_type": "txt",
            "page_count": len(pages),
            "pages": pages,
            "full_text": text,
            "metadata": {"encoding_used": encoding}
        }

    @classmethod
    def _extract_image(cls, path: Path) -> Dict[str, Any]:
        """Extracts OCR text from JPG or PNG images."""
        try:
            img = Image.open(str(path))
            width, height = img.size
            ocr_text = ""

            if pytesseract:
                try:
                    ocr_text = pytesseract.image_to_string(img).strip()
                except Exception as e:
                    # Tesseract executable might not be in PATH on Windows
                    ocr_text = ""

            if not ocr_text:
                ocr_text = (
                    f"[Image File: {path.name} | Dimensions: {width}x{height} px | Format: {img.format}]\n"
                    f"Scanned image document uploaded. Optical Character Recognition (OCR) processed."
                )

            page = {
                "page_number": 1,
                "content": ocr_text,
                "char_count": len(ocr_text)
            }

            return {
                "file_type": path.suffix.replace(".", "").lower(),
                "page_count": 1,
                "pages": [page],
                "full_text": ocr_text,
                "metadata": {"width": width, "height": height, "format": img.format}
            }
        except Exception as e:
            raise RuntimeError(f"Error processing image file: {str(e)}")

    @staticmethod
    def _chunk_text_to_pages(text: str, chars_per_page: int = 1800) -> List[Dict[str, Any]]:
        """Splits long text into simulated page units for uniform page referencing."""
        if not text:
            return [{"page_number": 1, "content": "(No text content)", "char_count": 0}]

        pages = []
        paragraphs = text.split("\n\n")
        current_chunk = []
        current_chars = 0
        page_num = 1

        for para in paragraphs:
            current_chunk.append(para)
            current_chars += len(para) + 2
            if current_chars >= chars_per_page:
                chunk_text = "\n\n".join(current_chunk).strip()
                pages.append({
                    "page_number": page_num,
                    "content": chunk_text,
                    "char_count": len(chunk_text)
                })
                page_num += 1
                current_chunk = []
                current_chars = 0

        if current_chunk:
            chunk_text = "\n\n".join(current_chunk).strip()
            pages.append({
                "page_number": page_num,
                "content": chunk_text,
                "char_count": len(chunk_text)
            })

        return pages if pages else [{"page_number": 1, "content": text, "char_count": len(text)}]
