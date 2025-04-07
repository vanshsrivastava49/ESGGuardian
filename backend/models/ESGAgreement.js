const mongoose = require("mongoose");

const ESGAgreementSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  validated: { type: Boolean, default: false },
  filePath: { type: String, required: true },
  fileHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("ESGAgreement", ESGAgreementSchema);
