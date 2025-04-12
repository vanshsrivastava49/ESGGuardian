const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const ESGAgreement = require("../models/ESGAgreement");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Upload route
router.post("/upload", upload.single("agreement"), async (req, res) => {
  try {
    const { companyName, fileHash } = req.body;
    const newAgreement = new ESGAgreement({
      companyName,
      validated: false,
      filePath: `/uploads/${req.file.filename}`,
      fileHash,
    });
    const saved = await newAgreement.save();
    res.status(200).json({
      message: "✅ File saved and metadata stored.",
      agreementId: saved._id,
      agreement: saved,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Validate with ML model
router.post("/validate-ml", async (req, res) => {
  const { agreementId } = req.body;

  try {
    const agreement = await ESGAgreement.findById(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    const formData = new FormData();
    const absolutePath = path.join(__dirname, "..", agreement.filePath);
    formData.append("file", fs.createReadStream(absolutePath));

    const response = await axios.post("http://localhost:5001/predict-esg", formData, {
      headers: formData.getHeaders(),
    });

    const { esg_score, violated_norms } = response.data;

    agreement.validated = true;
    agreement.esgScore = esg_score;
    agreement.violatedNorms = violated_norms;
    await agreement.save();

    res.status(200).json({
      message: "✅ Agreement validated using ML",
      agreement,
    });
  } catch (err) {
    console.error("ML Validation failed:", err.message);
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
});

module.exports = router;
