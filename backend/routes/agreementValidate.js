const express = require("express");
const axios = require("axios");
const Agreement = require("../models/Agreement"); // Adjust path if needed
const router = express.Router();

// Validate ESG Agreement
router.post("/validate", async (req, res) => {
  const { agreementId } = req.body;

  try {
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    const companyQuery = agreement.companyName || "Tesla"; // fallback test
    const esgResponse = await axios.get(
      "https://esg-environmental-social-governance-data.p.rapidapi.com/goals",
      {
        params: { q: companyQuery },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "esg-environmental-social-governance-data.p.rapidapi.com",
        },
      }
    );

    const data = esgResponse.data;
    const isCompliant = data?.goals?.length > 0; // basic check — customize logic

    // Update agreement record
    agreement.validated = isCompliant;
    await agreement.save();

    return res.status(200).json({
      message: isCompliant ? "Agreement is ESG compliant" : "Agreement not ESG compliant",
      validated: isCompliant,
      esgData: data,
    });
  } catch (error) {
    console.error("Validation error:", error.message);
    return res.status(500).json({ message: "Validation failed", error: error.message });
  }
});

module.exports = router;
