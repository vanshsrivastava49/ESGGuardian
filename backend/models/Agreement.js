const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  validated: {
    type: Boolean,
    default: false,
  },
  fileHash: {
    type: String,
    required: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Agreement", agreementSchema);
