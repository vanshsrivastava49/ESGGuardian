const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createContract, getContracts } = require("../controllers/contractController");
// Ensure both are functions before using them
router.post("/create", auth, createContract);
router.get("/", auth, getContracts);

module.exports = router;
