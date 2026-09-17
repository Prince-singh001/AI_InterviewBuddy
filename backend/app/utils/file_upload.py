import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/markdown': '.md',
}


async def save_upload(file: UploadFile, subfolder: str = 'resumes') -> tuple[str, str]:
    """Save uploaded file and return (file_path, original_filename)."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f'File type {file.content_type} not allowed. Use PDF, DOCX, or TXT.')

    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(400, f'File too large. Max {settings.MAX_FILE_SIZE_MB}MB.')

    ext = ALLOWED_TYPES[file.content_type]
    unique_name = f'{uuid.uuid4()}{ext}'
    upload_dir = Path(settings.UPLOAD_DIR) / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / unique_name

    with open(file_path, 'wb') as f:
        f.write(content)

    return str(file_path), file.filename or unique_name


def extract_text(file_path: str) -> str:
    """Extract plain text from PDF, DOCX, or TXT file."""
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == '.txt' or ext == '.md':
        return path.read_text(encoding='utf-8', errors='ignore')

    if ext == '.pdf':
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(path))
            return ' '.join(page.extract_text() or '' for page in reader.pages)
        except ImportError:
            return 'PDF parsing unavailable. Install pypdf.'

    if ext == '.docx':
        try:
            from docx import Document
            doc = Document(str(path))
            return ' '.join(para.text for para in doc.paragraphs)
        except ImportError:
            return 'DOCX parsing unavailable. Install python-docx.'

    return ''
