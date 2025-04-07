const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Route to handle upload
router.post("/upload", upload.single("agreement"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Save to DB if needed

  res.status(200).json({
    message: "Upload successful!",
    filePath: req.file.path,
  });
});

module.exports = router;
