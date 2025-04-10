from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

from predict import esg_model  # ✅ Correct import from esg_model

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ Define upload folder based on the actual backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # e.g., /path/to/project/backend
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")      # e.g., /path/to/project/backend/uploads

# Create uploads folder if not present
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route("/api/agreements/validate", methods=["POST"])
def validate_agreement():
    try:
        data = request.get_json()
        agreement_id = data.get("agreementId")

        if not agreement_id:
            return jsonify({"error": "Agreement ID is required"}), 400

        # ✅ The filename is derived using agreement ID (same logic used during upload)
        filename = f"{agreement_id}.txt"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # ✅ Check if file exists
        if not os.path.exists(filepath):
            return jsonify({"error": f"File not found: {filename}"}), 404

        logger.info(f"🔍 Validating ESG agreement from file: {filepath}")

        # ✅ Run ML model on the file
        result = esg_model(filepath)

        return jsonify({
            "message": "ESG validation completed",
            "agreementId": agreement_id,
            "esg_score": result["esg_score"],
            "violated_norms": result["violated_norms"]
        })

    except Exception as e:
        logger.error(f"❌ Validation error: {str(e)}")
        return jsonify({"error": "Validation failed", "details": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return "✅ ESG Validator API is running"

if __name__ == "__main__":
    app.run(debug=True)
