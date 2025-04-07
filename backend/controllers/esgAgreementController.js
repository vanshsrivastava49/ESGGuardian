const Agreement = require("../models/Agreement");
const fs = require("fs");

exports.uploadAgreement = async (req, res) => {
  try {
    const agreement = new Agreement({
      userId: req.user.id,
      filePath: req.file.path,
    });
    await agreement.save();
    res.status(201).json({ message: "Agreement uploaded successfully", agreement });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

exports.validateAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    // Simulated ESG validation logic
    const remarks = "Validated with ESG compliance guidelines. [Simulated]";
    const updated = await Agreement.findByIdAndUpdate(id, {
      validated: true,
      remarks,
      updatedAt: new Date()
    }, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Validation failed", error });
  }
};

exports.getAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({ userId: req.user.id });
    res.json(agreements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agreements" });
  }
};
