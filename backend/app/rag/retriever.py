from pathlib import Path
import pickle
from typing import List, Optional, Tuple

import faiss
import numpy as np
from openai import OpenAI

from app.core.config import settings


def _resolve_path(path_str: str) -> Path:
    path = Path(path_str)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[2] / path
    return path


class DoctorRetriever:
    def __init__(self):
        self.index: Optional[faiss.Index] = None
        self.metadata: Optional[List[dict]] = None
        self.client: Optional[OpenAI] = None

    def _ensure_client(self):
        if not self.client:
            if not settings.OPENAI_API_KEY:
                raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def _ensure_loaded(self):
        if self.index is not None and self.metadata is not None:
            return

        index_path = _resolve_path(settings.RAG_INDEX_PATH)
        meta_path = _resolve_path(settings.RAG_META_PATH)

        if not index_path.exists() or not meta_path.exists():
            raise FileNotFoundError("RAG 인덱스 또는 메타데이터가 없습니다. ingest 스크립트를 먼저 실행하세요.")

        self.index = faiss.read_index(str(index_path))
        with open(meta_path, "rb") as f:
            self.metadata = pickle.load(f)

    def _embed_query(self, query: str) -> np.ndarray:
        self._ensure_client()
        resp = self.client.embeddings.create(model=settings.EMBEDDING_MODEL, input=[query])
        vec = np.array(resp.data[0].embedding, dtype="float32")
        norm = np.linalg.norm(vec)
        if norm == 0:
            norm = 1e-10
        vec = vec / norm
        return vec.reshape(1, -1)

    def search(self, query: str, top_k: int = 4, score_threshold: float = 0.25) -> str:
        self._ensure_loaded()
        query_vec = self._embed_query(query)
        scores, indices = self.index.search(query_vec, top_k)

        results: List[Tuple[float, dict]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            if score < score_threshold:
                continue
            meta = self.metadata[idx]
            results.append((float(score), meta))

        if not results:
            return ""

        formatted = []
        for score, meta in results:
            formatted.append(
                f"- [p{meta['page']}:{meta['chunk_id']}] (score {score:.2f}) {meta['content']}"
            )
        return "\n".join(formatted)


doctor_retriever = DoctorRetriever()
