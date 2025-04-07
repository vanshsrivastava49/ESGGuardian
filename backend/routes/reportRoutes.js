const express = require("express");
const { createReport, getReports } = require("../controllers/reportController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/create", auth, createReport);
router.get("/", getReports);

module.exports = router;
