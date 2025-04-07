const ESGAgreement = require("../models/ESGAgreement");
const { extractTextFromFile } = require("../utils/fileParser");
const { fetchESGStandards } = require("../utils/esgAPI");
const { evaluateESGCompliance } = require("../utils/mlModel");

exports.uploadAgreement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Extract text from uploaded file (PDF, DOCX, TXT)
    const textContent = await extractTextFromFile(req.file.path);

    // Fetch ESG standard data (from ESG API or static data)
    const esgData = await fetchESGStandards();

    // Use ML model to evaluate ESG compliance
    const { score, issues } = await evaluateESGCompliance(textContent, esgData);

    // Create and save ESG Agreement record
    const newAgreement = new ESGAgreement({
      companyName: req.body.companyName || "Unknown",
      validated: issues.length === 0,
      filePath: `/uploads/${req.file.filename}`,
      fileHash: req.body.fileHash || null,
      esgScore: score,
      validationErrors: issues,
    });

    await newAgreement.save();

    res.status(200).json({
      message: "Upload successful!",
      agreement: newAgreement,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
