"""
Common RAG ingestion script (shared mode).

Requirements:
- Set OPENAI_API_KEY via env or .env
- Run from backend directory: `python app/rag/ingest_common.py`
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
PDF_PATH = BASE_PDF_DIR / "\uc601\uc720\uc544\uac74\uac15\uac80\uc9c4\uad00\ub828_\uc9c8\ubcd1\uad00\ub9ac\uccad.pdf"
INDEX_PATH = Path(__file__).resolve().parent / "index_common.faiss"
META_PATH = Path(__file__).resolve().parent / "index_common.pkl"

CHUNK_TOKENS = 750
CHUNK_OVERLAP = 120

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
    if not PDF_PATH.exists():
        raise FileNotFoundError(f"PDF not found: {PDF_PATH}")

    reader = PdfReader(str(PDF_PATH))
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
                    "source": PDF_PATH.name,
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

    print(f"[INGEST COMMON] Loading PDF: {PDF_PATH.name}")
    docs = extract_chunks()
    print(f"[INGEST COMMON] Extracted chunks: {len(docs)}")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    texts = [d["content"] for d in docs]
    vectors = embed_texts(client, texts)
    index = build_index(vectors)

    faiss.write_index(index, str(INDEX_PATH))
    with open(META_PATH, "wb") as f:
        pickle.dump(docs, f)

    print(f"[INGEST COMMON] Saved index to {INDEX_PATH}")
    print(f"[INGEST COMMON] Saved metadata to {META_PATH}")
    print("[INGEST COMMON] Done.")


if __name__ == "__main__":
    main()
