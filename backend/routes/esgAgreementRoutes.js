const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const ESGAgreement = require("../models/ESGAgreement");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("agreement"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newAgreement = new ESGAgreement({
      companyName: req.body.companyName || "Unknown",
      validated: false,
      filePath: `/uploads/${req.file.filename}`,
      fileHash: req.body.fileHash || null,
    });

    await newAgreement.save();

    res.status(200).json({
      message: "Upload successful!",
      agreement: newAgreement,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const agreements = await ESGAgreement.find().sort({ createdAt: -1 });
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch agreements", error: err.message });
  }
});

router.post("/validate", upload.single("agreement"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded for validation" });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post("https://esg-text-analysis.p.rapidapi.com/analyze", formData, {
      headers: {
        ...formData.getHeaders(),
        "X-RapidAPI-Key": "719d84826cmsh5381ea8abcc5701p14a317jsn17479f3992da",
        "X-RapidAPI-Host": "esg-text-analysis.p.rapidapi.com",
      },
    });

    const { esg_score, violated_norms } = response.data;

    res.status(200).json({
      message: "Validation complete",
      esgScore: esg_score,
      violatedNorms: violated_norms,
    });
  } catch (err) {
    console.error("Validation failed:", err.message);
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
});

module.exports = router;
