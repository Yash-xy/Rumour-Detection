import pandas as pd
import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer

print("🔵 Loading dataset...")

df = pd.read_csv("backend/data/govt_schemes_updated.csv")
df = df.drop(columns=[c for c in df.columns if "Unnamed" in c])
df.fillna("", inplace=True)

df["combined_text"] = (
    df["scheme_name"].astype(str) + ". " +
    df["details"].astype(str) + " " +
    df["benefits"].astype(str) + " " +
    df["eligibility"].astype(str) + " " +
    df["schemeCategory"].astype(str) + " " +
    df["tags"].astype(str)
)

print("🧠 Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("🔵 Creating embeddings...")
embeddings = model.encode(
    df["combined_text"].tolist(),
    show_progress_bar=True
)

embeddings = np.array(embeddings).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, "backend/scheme_index.faiss")
pickle.dump(df, open("backend/scheme_metadata.pkl", "wb"))

print("✅ Index built successfully!")
