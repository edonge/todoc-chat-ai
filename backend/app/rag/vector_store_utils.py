import pickle
from pathlib import Path
from typing import List, Tuple

import faiss
import torch
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document


DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


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


def _ensure_sdp_kernel_attrs() -> None:
    """
    Transformers 4.46+ expects torch.backends.cuda.sdp_kernel to expose several
    attributes. The CPU-only torch build exposes it as a plain function, so we
    attach the missing attributes to avoid AttributeError during model init.
    """
    sdp_kernel = getattr(torch.backends.cuda, "sdp_kernel", None)
    if sdp_kernel is None:
        return

    for attr, value in [
        ("require_contiguous_qkv", False),
        ("enable_flash", False),
        ("enable_mem_efficient", False),
        ("enable_math", True),
    ]:
        if not hasattr(sdp_kernel, attr):
            setattr(sdp_kernel, attr, value)


def _rebuild_embedder(store: FAISS) -> HuggingFaceEmbeddings:
    _ensure_sdp_kernel_attrs()
    model_name = getattr(store.embedding_function, "model_name", DEFAULT_MODEL_NAME)
    encode_kwargs = getattr(store.embedding_function, "encode_kwargs", None)
    if not encode_kwargs:
        encode_kwargs = {"normalize_embeddings": True}

    return HuggingFaceEmbeddings(model_name=model_name, encode_kwargs=encode_kwargs)


def load_faiss_store(path: Path) -> FAISS:
    if not path.exists():
        raise FileNotFoundError(f"Vector store not found: {path}")

    with open(path, "rb") as f:
        store = pickle.load(f)

    if not isinstance(store, FAISS):
        raise TypeError(f"Unexpected vector store type: {type(store)} for {path}")

    # Ensure embedding function loads in this runtime with safe attention settings.
    store.embedding_function = _rebuild_embedder(store)
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
