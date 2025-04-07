const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ESGAgreement = require("../models/ESGAgreement"); // Make sure this model exists

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
  }
});

const upload = multer({ storage });

// POST - Upload an agreement
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

// GET - Fetch all uploaded agreements
router.get("/all", async (req, res) => {
  try {
    const agreements = await ESGAgreement.find().sort({ createdAt: -1 });
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch agreements", error: err.message });
  }
});

module.exports = router;
