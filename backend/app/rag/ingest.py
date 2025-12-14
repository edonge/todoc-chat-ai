"""
Doctor AI RAG ingestion script.

Requirements:
- Set OPENAI_API_KEY via env or .env
- Run from backend directory: `python app/rag/ingest.py`
"""
from pathlib import Path
import pickle
from typing import List, Dict

import faiss
import numpy as np
from openai import OpenAI
from pypdf import PdfReader
import tiktoken

from app.core.config import settings


BASE_PDF_DIR = Path(__file__).resolve().parents[3] / "pdf"
DOCTOR_PDF = BASE_PDF_DIR / "\uc601\uc720\uc544\uac74\uac15\uac80\uc9c4\uac80\uc9c4\uc758\uc0ac\uc0c1\ub2f4\ub9e4\ub274\uc5bc_\ubcf4\uac74\ubcf5\uc9c0\ubd80_\uc9c8\ubcd1\uad00\ub9ac\uccad_\uad6d\ubbfc\uac74\uac15\ubcf4\ud5d8.pdf"
INDEX_PATH = Path(__file__).resolve().parent / "index_doctor.faiss"
META_PATH = Path(__file__).resolve().parent / "index_doctor.pkl"

CHUNK_TOKENS = 750
CHUNK_OVERLAP = 120
TOP_K = 4  # kept for reference; retrieval handles dynamically

encoding = tiktoken.get_encoding("cl100k_base")


def chunk_by_tokens(text: str, chunk_size: int, overlap: int) -> List[str]:
    tokens = encoding.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(len(tokens), start + chunk_size)
        chunk_tokens = tokens[start:end]
        chunks.append(encoding.decode(chunk_tokens))
        start = end - overlap
        if start < 0:
            start = 0
    return chunks


def extract_chunks() -> List[Dict]:
    if not DOCTOR_PDF.exists():
        raise FileNotFoundError(f"PDF not found: {DOCTOR_PDF}")

    reader = PdfReader(str(DOCTOR_PDF))
    docs = []
    for page_no, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = text.replace("\u3000", " ").replace("\xa0", " ").strip()
        if not text:
            continue
        for idx, chunk in enumerate(chunk_by_tokens(text, CHUNK_TOKENS, CHUNK_OVERLAP)):
            chunk = chunk.strip()
            if not chunk:
                continue
            docs.append(
                {
                    "page": page_no,
                    "chunk_id": f"{page_no}-{idx}",
                    "content": chunk,
                }
            )
    return docs


def embed_texts(client: OpenAI, texts: List[str]) -> np.ndarray:
    embeddings = []
    for i in range(0, len(texts), 16):
        batch = texts[i : i + 16]
        resp = client.embeddings.create(model=settings.EMBEDDING_MODEL, input=batch)
        for item in resp.data:
            embeddings.append(item.embedding)
    return np.array(embeddings, dtype="float32")


def build_index(vectors: np.ndarray) -> faiss.IndexFlatIP:
    # Normalize for cosine similarity
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    vectors = vectors / norms
    dim = vectors.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(vectors)
    return index


def main():
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    print(f"[INGEST] Loading PDF: {DOCTOR_PDF.name}")
    docs = extract_chunks()
    print(f"[INGEST] Extracted chunks: {len(docs)}")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    texts = [d["content"] for d in docs]
    vectors = embed_texts(client, texts)
    index = build_index(vectors)

    faiss.write_index(index, str(INDEX_PATH))
    with open(META_PATH, "wb") as f:
        pickle.dump(docs, f)

    print(f"[INGEST] Saved index to {INDEX_PATH}")
    print(f"[INGEST] Saved metadata to {META_PATH}")
    print("[INGEST] Done.")


if __name__ == "__main__":
    main()
