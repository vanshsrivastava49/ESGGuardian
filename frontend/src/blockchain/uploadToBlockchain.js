import { ethers } from "ethers";

// Minimal ABI for your smart contract interaction
const contractABI = [
  "function uploadAgreement(string _fileHash, string _companyName, string _esgStatus) public",
  "function getAgreement(uint256 _id) public view returns (string, string, string, bool, address, uint256)"
];

const contractAddress = "0x14294F78630842145e2615eFA96FDAc46E52fb5a";
export const uploadAgreementToBlockchain = async (fileHash, companyName, esgStatus) => {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed. Please install it to use this feature.");
    }

    // Connect to the Ethereum provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Request account access if needed
    await provider.send("eth_requestAccounts", []);

    // Get signer (current connected wallet)
    const signer = provider.getSigner();

    // Create a contract instance with signer
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Call the smart contract function
    const tx = await contract.uploadAgreement(fileHash, companyName, esgStatus);
    await tx.wait(); // Wait for the transaction to be mined

    console.log("✅ Agreement uploaded successfully. Tx hash:", tx.hash);
    return { success: true, txHash: tx.hash };
  } catch (err) {
    console.error("❌ Error uploading agreement:", err);
    return { success: false, error: err.message };
  }
};