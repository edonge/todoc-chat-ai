import pickle
from functools import lru_cache
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import faiss
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from app.core.config import settings


# Default fallback if env/config is missing
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"


def _clean_text(text: str) -> str:
    allowed = []
    for ch in text:
        code = ord(ch)
        if ch.isascii() and (ch.isspace() or ch.isalnum() or ch in "-_.,;:!%?()/[]"):
            allowed.append(ch)
        elif 0xAC00 <= code <= 0xD7A3:  # Hangul syllables
            allowed.append(ch)
    cleaned = "".join(allowed)
    return " ".join(cleaned.split())


def _get_openai_embedder() -> OpenAIEmbeddings:
    model = settings.EMBEDDING_MODEL or OPENAI_EMBEDDING_MODEL
    return OpenAIEmbeddings(model=model)


def load_faiss_store(path: Path) -> FAISS:
    if not path.exists():
        raise FileNotFoundError(f"Vector store not found: {path}")

    with open(path, "rb") as f:
        store = pickle.load(f)

    if not isinstance(store, FAISS):
        raise TypeError(f"Unexpected vector store type: {type(store)} for {path}")

    # Use OpenAI embeddings for query embedding
    store.embedding_function = _get_openai_embedder()
    return store


def _iter_vector_stores(paths: Iterable[Path]) -> List[FAISS]:
    """Load multiple FAISS stores, ignoring missing/invalid files with a warning."""
    stores: List[FAISS] = []
    for path in paths:
        try:
            stores.append(load_faiss_store(path))
        except FileNotFoundError:
            # Skip silently; caller prepares directories that may be empty.
            continue
        except Exception as exc:
            # Soft-fail on bad files so other stores still load.
            print(f"[RAG] Failed to load vector store {path}: {exc}")
            continue
    return stores


@lru_cache(maxsize=32)
def load_vectorstores_from_dir(dir_path: Path) -> List[FAISS]:
    """Load every .pkl LangChain FAISS store in a directory (cached)."""
    if not dir_path.exists() or not dir_path.is_dir():
        return []
    paths = sorted(dir_path.glob("*.pkl"))
    return _iter_vector_stores(paths)


def load_vectorstores_from_dirs(dir_paths: Iterable[Path]) -> List[FAISS]:
    """Aggregate stores from multiple directories (cached per dir)."""
    stores: List[FAISS] = []
    for dir_path in dir_paths:
        stores.extend(load_vectorstores_from_dir(dir_path))
    return stores


def search_vectorstores(
    query: str,
    stores: List[FAISS],
    top_k: int,
    score_threshold: float,
) -> str:
    results: List[Tuple[float, Document]] = []

    for store in stores:
        metric = getattr(store.index, "metric_type", None)
        hits = store.similarity_search_with_score(query, k=top_k)
        for doc, score in hits:
            if metric == faiss.METRIC_L2:
                rel_score = 1.0 / (1.0 + float(score))
            else:
                rel_score = float(score)

            if rel_score < score_threshold:
                continue

            results.append((rel_score, doc))

    if not results:
        return ""

    results.sort(key=lambda item: item[0], reverse=True)
    formatted = []

    for score, doc in results[:top_k]:
        meta = doc.metadata or {}
        source = meta.get("source") or meta.get("title") or "source"
        try:
            source = Path(source).name
        except Exception:
            pass

        page = meta.get("page_label") or meta.get("page") or "?"
        chunk_id = meta.get("chunk_id") or meta.get("page_label") or ""
        snippet = doc.page_content.replace("\n", " ").strip()
        snippet = snippet.replace("\ufffd", "")
        snippet = snippet.replace("\u2022", "-")
        snippet = snippet.encode("utf-8", errors="ignore").decode("utf-8")
        snippet = _clean_text(snippet)

        formatted.append(f"- [{source} p{page}:{chunk_id}] (rel {score:.2f}) {snippet}")

    return "\n".join(formatted)


def search_vector_dirs(
    query: str,
    directories: Iterable[Path],
    top_k: int = 4,
    score_threshold: float = 0.25,
) -> str:
    """Search across all pkl stores inside the given directories."""
    stores = load_vectorstores_from_dirs(directories)
    if not stores:
        return ""
    return search_vectorstores(query, stores, top_k=top_k, score_threshold=score_threshold)
