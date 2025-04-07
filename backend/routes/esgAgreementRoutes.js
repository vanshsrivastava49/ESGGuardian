const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const ESGAgreement = require("../models/ESGAgreement");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/upload", upload.single("agreement"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { companyName, fileHash } = req.body;

    if (!companyName || !fileHash) {
      return res.status(400).json({ message: "Missing company name or file hash" });
    }

    const newAgreement = new ESGAgreement({
      companyName,
      validated: false,
      filePath: `/uploads/${req.file.filename}`,
      fileHash,
    });

    const saved = await newAgreement.save();

    res.status(200).json({
      message: "✅ File saved to server & metadata stored in MongoDB.",
      agreementId: saved._id,
      agreement: saved,
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "❌ Upload failed", error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const agreements = await ESGAgreement.find().sort({ createdAt: -1 });
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch agreements", error: err.message });
  }
});

router.post("/validate", upload.single("agreement"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded for validation" });

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post("http://localhost:5001/predict-esg", formData, {
      headers: formData.getHeaders(),
    });

    const { esg_score, violated_norms } = response.data;

    res.status(200).json({
      message: "✅ Validation complete",
      esgScore: esg_score,
      violatedNorms: violated_norms,
    });
  } catch (err) {
    console.error("Validation failed:", err.message);
    res.status(500).json({ message: "❌ Validation failed", error: err.message });
  }
});

module.exports = router;
