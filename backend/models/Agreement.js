const mongoose = require("mongoose");

const ESGAgreementSchema = new mongoose.Schema(
  {
    companyName: String,
    validated: Boolean,
    filePath: String,
    fileHash: String,
    esgScore: Number,
    violatedNorms: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ESGAgreement", ESGAgreementSchema);
