import pickle
from pathlib import Path
from typing import List, Tuple

import faiss
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document


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
    return OpenAIEmbeddings(model=OPENAI_EMBEDDING_MODEL)


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
