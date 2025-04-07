const Report = require("../models/Report");

exports.createReport = async (req, res) => {
  const { companyName, esgScore, dataSource } = req.body;
  try {
    const report = await Report.create({
      companyName,
      esgScore,
      dataSource,
      createdBy: req.user.id
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  const reports = await Report.find().populate("createdBy", "name");
  res.json(reports);
};
