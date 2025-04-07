const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  companyName: String,
  esgScore: Number,
  dataSource: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
