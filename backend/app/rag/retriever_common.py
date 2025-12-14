from pathlib import Path
from typing import List, Optional

from app.rag.vector_store_utils import load_faiss_store, search_vectorstores


class CommonRetriever:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent / "vector_db"
        self.store_paths: List[Path] = [
            base_dir / "영유아건강검진관련_질병관리청.pkl"
        ]
        self.stores: Optional[List] = None

    def _ensure_loaded(self):
        if self.stores is None:
            self.stores = [load_faiss_store(path) for path in self.store_paths]

    def search(self, query: str, top_k: int = 3, score_threshold: float = 0.25) -> str:
        self._ensure_loaded()
        return search_vectorstores(query, self.stores, top_k, score_threshold)


common_retriever = CommonRetriever()
