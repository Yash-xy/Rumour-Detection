import os
import re
import pickle
import numpy as np
import pandas as pd

# Attempt to import sentence-transformers but don't fail at import time
# (some environments block native libs like PyTorch DLLs). If import
# fails we set placeholders and allow the rest of the module to load;
# we also provide an optional Hugging Face Inference API fallback so the
# service can run without local torch.
try:
    from sentence_transformers import SentenceTransformer, util
    _st_available = True
except Exception as e:
    SentenceTransformer = None
    util = None
    _st_available = False
    print("sentence_transformers import failed:", e)

# HTTP client for HF fallback (may be available via existing deps)
try:
    import httpx
    _httpx_available = True
except Exception:
    httpx = None
    _httpx_available = False

# Optional lightweight fallback using TF-IDF when semantic model is unavailable
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as sk_cos_sim
    _sklearn_available = True
except Exception:
    TfidfVectorizer = None
    sk_cos_sim = None
    _sklearn_available = False

try:
    import faiss  # optional dependency
    _faiss_available = True
except Exception:
    faiss = None
    _faiss_available = False

# ------------------------
# Lazy loading model, index and metadata
# ------------------------
_model = None
_index = None
_meta = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "data", "govt_schemes_updated.csv")
FAISS_PATH = os.path.join(BASE_DIR, "scheme_index.faiss")
META_PATH = os.path.join(BASE_DIR, "scheme_metadata.pkl")


def get_model():
    global _model
    if _model is None:
        print("Loading SentenceTransformer model... This may take a while the first time.")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model loaded successfully!")
    return _model


def load_metadata():
    global _meta
    if _meta is not None:
        return _meta
    if os.path.exists(META_PATH):
        try:
            with open(META_PATH, "rb") as f:
                _meta = pickle.load(f)
            print("Loaded metadata from scheme_metadata.pkl")
            return _meta
        except Exception as e:
            print("Failed to load metadata pickle:", e)
    if os.path.exists(CSV_PATH):
        _meta = pd.read_csv(CSV_PATH)
        print("Loaded metadata from CSV")
        return _meta
    raise FileNotFoundError("No metadata found")


def load_faiss_index():
    global _index, faiss, _faiss_available
    if not _faiss_available:
        return None
    if _index is not None:
        return _index
    if os.path.exists(FAISS_PATH):
        try:
            _index = faiss.read_index(FAISS_PATH)
            print("Loaded FAISS index from scheme_index.faiss")
            return _index
        except Exception as e:
            print("Failed to load FAISS index:", e)
    return None


def preprocess_text(text):
    text = str(text).lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    return text


def _build_result(row, similarity):
    """Build an enriched result dict from a metadata row."""
    similarity = round(float(similarity), 3)
    return {
        "scheme": row.get("scheme_name", "Unknown"),
        "slug": str(row.get("slug", "")) if row.get("slug") else "",
        "level": row.get("level", "Unknown"),
        "similarity": similarity,
        "verdict": "Not Rumor" if similarity > 0.50 else "Rumor",
        "details": str(row.get("details", "")) if row.get("details") else "",
        "benefits": str(row.get("benefits", "")) if row.get("benefits") else "",
        "eligibility": str(row.get("eligibility", "")) if row.get("eligibility") else "",
        "application": str(row.get("application", "")) if row.get("application") else "",
        "documents": str(row.get("documents", "")) if row.get("documents") else "",
        "category": str(row.get("schemecategory", "")) if row.get("schemecategory") else "",
        "tags": str(row.get("tags", "")) if row.get("tags") else "",
        "status": str(row.get("validity", "")) if row.get("validity") else "",
        "sentiment": str(row.get("sentiment", "")) if row.get("sentiment") else "",
    }


def check_claim(claim_text, top_k=5):
    if not claim_text:
        return []

    # Helper: use HF inference API to get embeddings when local model is unavailable
    def hf_embed(texts):
        api_key = os.environ.get("HUGGINGFACE_API_KEY") or os.environ.get("HF_API_KEY")
        if not api_key or not _httpx_available:
            return None
        url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        headers = {"Authorization": f"Bearer {api_key}"}
        try:
            # Accept either a single string or a list of strings
            payload = {"inputs": texts}
            resp = httpx.post(url, headers=headers, json=payload, timeout=60.0)
            resp.raise_for_status()
            data = resp.json()
            arr = np.array(data, dtype="float32")
            # If token-level outputs are returned (batch x tokens x dim), average tokens
            if arr.ndim == 3:
                arr = arr.mean(axis=1)
            if arr.ndim == 1:
                arr = arr.reshape(1, -1)
            return arr.astype("float32")
        except Exception as e:
            print("HF embedding failed:", e)
            return None

    def embed_texts(texts, model_obj=None):
        # texts: list[str] or single str
        single = False
        if isinstance(texts, str):
            texts = [texts]
            single = True

        if model_obj is not None:
            try:
                embs = [model_obj.encode(t, convert_to_numpy=True).astype("float32") for t in texts]
                arr = np.vstack(embs)
                return arr[0] if single else arr
            except Exception as e:
                print("Local model embedding failed:", e)

        # Try HF fallback
        hf = hf_embed(texts)
        if hf is not None:
            return hf[0] if single else hf

        return None

    try:
        meta = load_metadata()
        index = load_faiss_index()

        model_obj = None
        if _st_available:
            try:
                model_obj = get_model()
            except Exception as e:
                print("Failed to load local model:", e)
                model_obj = None

        claim_clean = preprocess_text(claim_text)
        results = []

        # If no semantic encoder (local or HF API key) is available, use a lightweight
        # TF-IDF fallback to compute similarities so the service still returns
        # useful results in restricted environments.
        hf_key = os.environ.get("HUGGINGFACE_API_KEY") or os.environ.get("HF_API_KEY")
        if model_obj is None and (not _httpx_available or not hf_key) and _sklearn_available:
            try:
                texts = []
                rows = []
                for _, row in meta.iterrows():
                    combined = (
                        str(row.get("scheme_name", ""))
                        + ". "
                        + str(row.get("details", ""))
                        + " "
                        + str(row.get("benefits", ""))
                        + " "
                        + str(row.get("eligibility", ""))
                        + " "
                        + str(row.get("schemecategory", ""))
                        + " "
                        + str(row.get("tags", ""))
                    )
                    texts.append(preprocess_text(combined))
                    rows.append(row)

                vectorizer = TfidfVectorizer(stop_words="english")
                tfidf_matrix = vectorizer.fit_transform(texts)
                claim_vec = vectorizer.transform([claim_clean])
                sims = sk_cos_sim(claim_vec, tfidf_matrix).flatten()
                for i, row in enumerate(rows):
                    results.append(_build_result(row, sims[i]))
                results = sorted(results, key=lambda x: x["similarity"], reverse=True)
                return results[:top_k]
            except Exception as e:
                print("TF-IDF fallback failed:", e)

        # If a FAISS index is available we can search it using embeddings
        if index is not None and meta is not None:
            claim_emb = embed_texts(claim_clean, model_obj=model_obj)
            if claim_emb is None:
                print("No embedding provider available for FAISS search")
                return []
            claim_emb = np.asarray(claim_emb).astype("float32")
            ntotal = int(getattr(index, "ntotal", 0))
            k = min(20, ntotal) if ntotal > 0 else 20
            try:
                D, I = index.search(np.array([claim_emb]), k)
            except Exception as e:
                print("FAISS search failed:", e)
                return []
            candidate_idxs = [int(i) for i in I[0] if i != -1]

            claim_norm = np.linalg.norm(claim_emb)
            for idx in candidate_idxs:
                try:
                    # try to reconstruct vector from index
                    try:
                        cand_vec = index.reconstruct(idx)
                        cand_vec = np.asarray(cand_vec).astype("float32")
                        sim = float(np.dot(claim_emb, cand_vec) / (claim_norm * (np.linalg.norm(cand_vec) + 1e-12)))
                    except Exception:
                        # fallback: encode candidate text
                        row = meta.iloc[idx]
                        combined = (
                            str(row.get("scheme_name", ""))
                            + ". "
                            + str(row.get("details", ""))
                            + " "
                            + str(row.get("benefits", ""))
                            + " "
                            + str(row.get("eligibility", ""))
                            + " "
                            + str(row.get("schemecategory", ""))
                            + " "
                            + str(row.get("tags", ""))
                        )
                        cand_emb = embed_texts(preprocess_text(combined), model_obj=model_obj)
                        if cand_emb is None:
                            continue
                        sim = float(np.dot(claim_emb, cand_emb) / (claim_norm * (np.linalg.norm(cand_emb) + 1e-12)))

                    row = meta.iloc[idx]
                    results.append(_build_result(row, sim))
                except Exception as e:
                    print(f"Error processing candidate {idx}: {e}")

            results = sorted(results, key=lambda x: x["similarity"], reverse=True)
            return results[:top_k]

        # Fallback: brute-force (slow)
        print("FAISS index not available — falling back to brute-force search")
        # Try to compute claim embedding
        claim_emb_vec = embed_texts(preprocess_text(claim_text), model_obj=model_obj)
        if claim_emb_vec is None:
            print("No embedding provider available for brute-force search")
            return []

        # Batch-encode all candidate texts if possible (HF supports batch)
        texts = []
        rows = []
        for _, row in meta.iterrows():
            combined = (
                str(row.get("scheme_name", ""))
                + ". "
                + str(row.get("details", ""))
                + " "
                + str(row.get("benefits", ""))
                + " "
                + str(row.get("eligibility", ""))
                + " "
                + str(row.get("schemecategory", ""))
                + " "
                + str(row.get("tags", ""))
            )
            texts.append(preprocess_text(combined))
            rows.append(row)

        cand_embs = None
        # If we have a local model, encode in Python; otherwise try HF batch
        if model_obj is not None:
            try:
                cand_embs = np.vstack([model_obj.encode(t, convert_to_numpy=True).astype("float32") for t in texts])
            except Exception as e:
                print("Local model batch encoding failed:", e)
                cand_embs = None

        if cand_embs is None:
            cand_embs = hf_embed(texts)

        if cand_embs is None:
            print("Failed to compute candidate embeddings")
            return []

        claim_norm = np.linalg.norm(claim_emb_vec)
        for i, row in enumerate(rows):
            try:
                cand_vec = np.asarray(cand_embs[i]).astype("float32")
                sim = float(np.dot(claim_emb_vec, cand_vec) / (claim_norm * (np.linalg.norm(cand_vec) + 1e-12)))
                results.append(_build_result(row, sim))
            except Exception as e:
                print(f"Error computing similarity for row {i}: {e}")

        results = sorted(results, key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    except Exception as e:
        print(f"Error in check_claim: {e}")
        return []

