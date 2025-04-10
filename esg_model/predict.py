import random

def predict_esg(filepath):
    """
    Simulates ESG scoring and norm detection from a text file.

    Parameters:
    - filepath (str): Path to the ESG agreement file.

    Returns:
    - dict: ESG score and violated norms (if any).
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return {
            "error": f"Failed to read file: {str(e)}"
        }

    # Simulated ESG score
    esg_score = round(random.uniform(0, 100), 2)
    violated_norms = []

    # Simple keyword-based rule checking
    if "pollution" in content.lower():
        violated_norms.append("Environmental Violation: Pollution Mentioned")

    if "child labor" in content.lower():
        violated_norms.append("Social Violation: Child Labor Mentioned")

    if "bribery" in content.lower():
        violated_norms.append("Governance Violation: Bribery Mentioned")

    if not violated_norms:
        violated_norms.append("No clear violation detected")

    return {
        "esg_score": esg_score,
        "violated_norms": violated_norms
    }
