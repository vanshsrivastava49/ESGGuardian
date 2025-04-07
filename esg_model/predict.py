import sys
import os
import joblib
import argparse
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import textwrap

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

MODEL_DIR = "model"
SCORE_MODEL_PATH = os.path.join(MODEL_DIR, "esg_score_model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")
VIOLATION_MODEL_PATH = os.path.join(MODEL_DIR, "violation_model.pkl")

ESG_CATEGORIES = {
    "Environmental": ["climate", "pollution", "resource", "waste", "energy", "biodiversity", "emissions"],
    "Social": ["labor", "human rights", "community", "diversity", "inclusion", "health", "safety"],
    "Governance": ["compliance", "ethics", "board", "transparency", "corruption", "risk", "management"]
}

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Predict ESG scores and violations from agreement text")
    parser.add_argument("text", nargs="?", help="Agreement text to analyze")
    parser.add_argument("--file", "-f", help="Path to text file containing agreement text")
    parser.add_argument("--output", "-o", help="Path to output file for results")
    parser.add_argument("--detailed", "-d", action="store_true", help="Show detailed analysis")
    return parser.parse_args()

def load_models():
    """Load all required models"""
    models = {}
    try:
        if not os.path.exists(MODEL_DIR):
            logger.error(f"Model directory '{MODEL_DIR}' not found.")
            return None
        
        if os.path.exists(VECTORIZER_PATH):
            models["vectorizer"] = joblib.load(VECTORIZER_PATH)
        else:
            logger.error(f"Vectorizer model '{VECTORIZER_PATH}' not found.")
            return None
        
        if os.path.exists(SCORE_MODEL_PATH):
            models["score_model"] = joblib.load(SCORE_MODEL_PATH)
        else:
            logger.warning(f"Score model '{SCORE_MODEL_PATH}' not found. Score prediction will be skipped.")
        
        if os.path.exists(VIOLATION_MODEL_PATH):
            models["violation_model"] = joblib.load(VIOLATION_MODEL_PATH)
        else:
            logger.warning(f"Violation model '{VIOLATION_MODEL_PATH}' not found. Violation prediction will be skipped.")
        
        return models
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return None

def get_text_input(args):
    """Get text input from command line argument or file"""
    if args.file:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            return None
    elif args.text:
        return args.text
    else:
        logger.error("No text provided. Use --text or --file argument.")
        return None

def get_esg_category_scores(text, vectorizer):
    """Calculate scores for each ESG category based on keyword presence"""
    # Get word counts for each category
    category_scores = {}
    
    # Transform text to vector space and get feature names
    text_vector = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()
    
    # Calculate scores for each category
    for category, keywords in ESG_CATEGORIES.items():
        # Find terms in the text that match keywords
        matching_terms = []
        for idx, feature in enumerate(feature_names):
            if any(keyword in feature.lower() for keyword in keywords):
                # If the feature is present in the document (TF-IDF > 0)
                if text_vector[0, idx] > 0:
                    matching_terms.append((feature, text_vector[0, idx]))
        
        # Calculate score based on number and weight of matches
        if matching_terms:
            # Sort by weight
            matching_terms.sort(key=lambda x: x[1], reverse=True)
            # Calculate score (0-100)
            score = min(100, int(sum(weight for _, weight in matching_terms) * 20))
            top_terms = [term for term, _ in matching_terms[:3]]
        else:
            score = 0
            top_terms = []
            
        category_scores[category] = {"score": score, "terms": top_terms}
    
    return category_scores

def predict_esg(text, models, detailed=False):
    """Predict ESG score and violations for given text"""
    results = {
        "text": text,
        "text_summary": textwrap.shorten(text, width=100, placeholder="..."),
        "prediction_success": True,
        "detailed": {}
    }
    
    try:
        # Transform text using vectorizer
        X = models["vectorizer"].transform([text])
        
        # Predict ESG Score if model exists
        if "score_model" in models:
            score = models["score_model"].predict(X)[0]
            results["esg_score"] = round(score, 2)
            
            # Add interpretation
            if score >= 80:
                results["score_interpretation"] = "Excellent ESG compliance"
            elif score >= 60:
                results["score_interpretation"] = "Good ESG compliance"
            elif score >= 40:
                results["score_interpretation"] = "Moderate ESG compliance"
            else:
                results["score_interpretation"] = "Poor ESG compliance"
        else:
            results["esg_score"] = None
            results["score_interpretation"] = "Score model not available"
        
        # Predict Violation if model exists
        if "violation_model" in models:
            # Get prediction and probabilities
            violation = models["violation_model"].predict(X)[0]
            probas = models["violation_model"].predict_proba(X)[0]
            
            # Get the index of the predicted class
            pred_idx = list(models["violation_model"].classes_).index(violation)
            confidence = probas[pred_idx]
            
            results["violation"] = violation if violation != "None" else None
            results["violation_confidence"] = round(confidence * 100, 2)
            
            # Add all class probabilities for detailed view
            if detailed:
                class_probas = {cls: round(prob * 100, 2) for cls, prob in zip(models["violation_model"].classes_, probas)}
                results["detailed"]["violation_probabilities"] = class_probas
        else:
            results["violation"] = None
            results["violation_confidence"] = None
        
        # Add detailed ESG category analysis
        if detailed:
            category_scores = get_esg_category_scores(text, models["vectorizer"])
            results["detailed"]["category_scores"] = category_scores
        
        return results
    
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        results["prediction_success"] = False
        results["error"] = str(e)
        return results

def format_results(results):
    """Format results for display"""
    output = []
    
    # Header
    output.append("\n=== ESG AGREEMENT ANALYSIS ===\n")
    
    # Text summary
    output.append(f"📄 Agreement Text (Summary):")
    output.append(f"{results['text_summary']}")
    
    # ESG Score
    if results["esg_score"] is not None:
        output.append(f"\n📊 Overall ESG Score: {results['esg_score']} / 100")
        output.append(f"📋 Interpretation: {results['score_interpretation']}")
    
    # Violation
    if results["violation"] is not None:
        output.append(f"\n🚨 Detected ESG Violation: {results['violation']}")
        output.append(f"   Confidence: {results['violation_confidence']}%")
    elif results["violation_confidence"] is not None:
        output.append(f"\n✅ No significant ESG violations detected")
        output.append(f"   Confidence: {results['violation_confidence']}%")
    
    # Detailed Analysis
    if "detailed" in results and results["detailed"]:
        # Category breakdowns
        if "category_scores" in results["detailed"]:
            output.append("\n=== DETAILED ESG CATEGORY ANALYSIS ===")
            for category, data in results["detailed"]["category_scores"].items():
                output.append(f"\n🔍 {category}: {data['score']} / 100")
                if data["terms"]:
                    output.append(f"   Key terms: {', '.join(data['terms'])}")
        
        # Violation probabilities
        if "violation_probabilities" in results["detailed"]:
            output.append("\n=== VIOLATION PROBABILITIES ===")
            for violation, prob in results["detailed"]["violation_probabilities"].items():
                if violation != "None":
                    output.append(f"   {violation}: {prob}%")
    
    # Recommendations
    output.append("\n=== RECOMMENDATIONS ===")
    if results["esg_score"] is not None and results["esg_score"] < 60:
        output.append("⚠️ Consider strengthening ESG compliance in the agreement.")
    if results["violation"] is not None:
        output.append(f"⚠️ Address potential {results['violation']} violations.")
    
    return "\n".join(output)

def main():
    """Main function"""
    # Parse arguments
    args = parse_arguments()
    
    # Load models
    models = load_models()
    if not models:
        return 1
    
    # Get text input
    text = get_text_input(args)
    if not text:
        return 1
    
    # Make prediction
    results = predict_esg(text, models, detailed=args.detailed)
    
    # Format and output results
    formatted_output = format_results(results)
    
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(formatted_output)
            print(f"Results saved to {args.output}")
        except Exception as e:
            logger.error(f"Error writing to output file: {e}")
    else:
        print(formatted_output)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())