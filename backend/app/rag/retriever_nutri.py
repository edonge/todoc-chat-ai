from pathlib import Path
from typing import List, Optional

from app.rag.vector_store_utils import load_faiss_store, search_vectorstores


class NutriRetriever:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent / "vector_db"
        self.store_paths: List[Path] = [
            base_dir / "어린이급식관리지원센터식단운영관리지침서_식품의약품안전처_식생활안전관리원.pkl"
        ]
        self.stores: Optional[List] = None

    def _ensure_loaded(self):
        if self.stores is None:
            self.stores = [load_faiss_store(path) for path in self.store_paths]

    def search(self, query: str, top_k: int = 4, score_threshold: float = 0.25) -> str:
        self._ensure_loaded()
        return search_vectorstores(query, self.stores, top_k, score_threshold)


nutri_retriever = NutriRetriever()
