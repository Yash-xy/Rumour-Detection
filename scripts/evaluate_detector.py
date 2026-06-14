import os
import sys
import json
import numpy as np

# Add the project root and backend to the path so we can import app
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "backend"))

# Mock environment variables if needed
os.environ["FAISS_PATH"] = os.path.join(PROJECT_ROOT, "backend", "scheme_index.faiss")
os.environ["META_PATH"] = os.path.join(PROJECT_ROOT, "backend", "scheme_metadata.pkl")

from app.services.rumor_detector import check_claim # type: ignore

def evaluate(thresholds=None):
    if thresholds is None:
        thresholds = [0.5, 0.6, 0.7]

    data_path = os.path.join(PROJECT_ROOT, "scripts", "test_schemes.json")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    with open(data_path, "r") as f:
        test_cases = json.load(f)
    
    print(f"{'Query':<50} | {'Expected':<10} | {'Top Sim':<8}")
    print("-" * 75)

    all_scores = []
    
    for case in test_cases:
        query = case["query"]
        expected = case["expected"]
        
        # Run the detector
        detector_results = check_claim(query, top_k=1)
        
        if not detector_results:
            top_sim = 0.0
        else:
            top_sim = detector_results[0]["similarity"]
        
        all_scores.append({
            "query": query,
            "expected": expected,
            "sim": top_sim
        })
        
        print(f"{query[:50]:<50} | {expected:<10} | {top_sim:<8.3f}")

    print("\n" + "="*50)
    print("METRICS ACROSS THRESHOLDS")
    print("="*50)
    print(f"{'Threshold':<10} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("-" * 65)

    best_f1 = -1
    best_t = 0.5

    # Test indices for evaluation
    eval_range = np.arange(0.3, 0.85, 0.05)
    for t in eval_range:
        tp, fp, tn, fn = 0, 0, 0, 0
        
        for record in all_scores:
            predicted = "Not Rumor" if record["sim"] > t else "Rumor"
            actual = record["expected"]
            
            if predicted == "Not Rumor" and actual == "Not Rumor":
                tp += 1
            elif predicted == "Not Rumor" and actual == "Rumor":
                fp += 1
            elif predicted == "Rumor" and actual == "Rumor":
                tn += 1
            elif predicted == "Rumor" and actual == "Not Rumor":
                fn += 1
        
        accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        print(f"{t:<10.2f} | {accuracy:<10.2f} | {precision:<10.2f} | {recall:<10.2f} | {f1:<10.2f}")
        
        if f1 >= best_f1:
            best_f1 = f1
            best_t = t

    print("\nRecommended Threshold: ", round(best_t, 2))
    print("This threshold balances Precision and Recall best for the current test set.")

if __name__ == "__main__":
    evaluate()
