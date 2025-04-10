const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Step 1: Setup Web3 and contract
const web3 = new Web3("http://127.0.0.1:7545"); // or your provider
const contractABI = require('../abis/ESGAgreementStorage.json');
const contractAddress = "0xYourContractAddress"; // Replace with real one

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Step 2: Controller to validate agreement
exports.validateAgreement = async (req, res) => {
  try {
    const { agreementId } = req.body;

    // 1. Get metadata from smart contract
    const data = await contract.methods.getAgreementById(agreementId).call();
    const fileHash = data.fileHash;

    // 2. Load the file using hash
    const filePath = path.join(__dirname, '../uploads/', fileHash); 
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found in uploads folder." });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // 3. Send text to ML model (Flask)
    const response = await axios.post('http://127.0.0.1:5000/predict', {
      text: fileContent,
    });

    // 4. Return result to frontend
    res.json({
      esg_score: response.data.esg_score,
      violated_norm: response.data.violated_norm,
      company_name: data.companyName,
      uploader: data.uploader,
    });

  } catch (error) {
    console.error("Error in validation:", error.message);
    res.status(500).json({ error: "Something went wrong during validation." });
  }
};
