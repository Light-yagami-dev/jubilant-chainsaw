import os
import uuid
import logging
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("doc-extractor")

app = FastAPI(title="Cortex Doc Extractor", version="1.0.0")

UPLOAD_DIR = Path("/tmp/cortex-uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED = {".pdf", ".txt"}

def extract_pdf(path: Path) -> tuple[str, int]:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(str(path))
        pages: list[str] = []
        for page in doc:
            pages.append(page.get_text("text"))
        doc.close()
        text = "\n\n".join(pages).strip()
        return text, len(pages)
    except ImportError:
        raise HTTPException(503, "PyMuPDF not installed — run: pip install pymupdf")

def extract_txt(content: bytes) -> tuple[str, int]:
    text = content.decode("utf-8", errors="replace").strip()
    lines = text.splitlines()
    approx_pages = max(1, len(lines) // 40)
    return text, approx_pages

@app.get("/health")
def health():
    return {"status": "ok", "service": "doc-extractor"}

@app.post("/extract")
async def extract(file: UploadFile):
    if not file.filename:
        raise HTTPException(400, "Missing filename")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED:
        raise HTTPException(
            400,
            f"Unsupported type '{suffix}'. Supported: {', '.join(SUPPORTED)}"
        )

    tmp_path = UPLOAD_DIR / f"{uuid.uuid4()}{suffix}"
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(400, "Empty file")

        tmp_path.write_bytes(contents)
        logger.info(f"Extracting {file.filename} ({len(contents)} bytes)")

        if suffix == ".txt":
            text, page_count = extract_txt(contents)
        else:
            text, page_count = extract_pdf(tmp_path)

        char_count = len(text)
        logger.info(f"Extracted {char_count} chars from {page_count} pages")

        return {
            "text": text,
            "page_count": page_count,
            "file_name": file.filename,
            "file_size": len(contents),
            "char_count": char_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        raise HTTPException(500, f"Extraction failed: {str(e)}")
    finally:
        if tmp_path.exists():
            tmp_path.unlink()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8083"))
    logger.info(f"Starting doc-extractor on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
