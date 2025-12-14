from pathlib import Path
from typing import List, Optional

from app.rag.vector_store_utils import load_faiss_store, search_vectorstores


class MomRetriever:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent / "vector_db"
        self.store_paths: List[Path] = [
            base_dir / "보호자용설명서_보건복지부_질병관리청_국민건강보험.pkl",
            base_dir / "표준보육과정해설서_교육부.pkl",
        ]
        self.stores: Optional[List] = None

    def _ensure_loaded(self):
        if self.stores is None:
            self.stores = [load_faiss_store(path) for path in self.store_paths]

    def search(self, query: str, top_k: int = 4, score_threshold: float = 0.25) -> str:
        self._ensure_loaded()
        return search_vectorstores(query, self.stores, top_k, score_threshold)


mom_retriever = MomRetriever()
