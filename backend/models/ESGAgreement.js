const mongoose = require("mongoose");

const ESGAgreementSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    validated: { type: Boolean, default: false },
    filePath: { type: String, required: true },
    fileHash: { type: String },

    // ✅ New fields for ML results:
    esgScore: { type: Number, default: 0 },
    validationErrors: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ESGAgreement", ESGAgreementSchema);
