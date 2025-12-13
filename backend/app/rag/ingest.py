"""
Doctor AI RAG 인덱스 생성 스크립트.

사용법:
- OPENAI_API_KEY를 환경변수나 .env에 설정한 뒤 실행
- backend 디렉터리에서: `python app/rag/ingest.py`
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


DOCTOR_PDF = Path(__file__).resolve().parents[3] / "RAG" / "영유아건강검진검진의사상담매뉴얼_보건복지부_질병관리청_국민건강보험.pdf"
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
    # Batch embeddings for efficiency
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
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")
    if not DOCTOR_PDF.exists():
        raise FileNotFoundError(f"PDF를 찾을 수 없습니다: {DOCTOR_PDF}")

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
