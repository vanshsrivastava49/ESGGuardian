import { ethers } from "ethers";

// Contract ABI (shortened for this example)
const contractABI = [
  "function uploadAgreement(string _fileHash, string _companyName, string _esgStatus) public",
  "function getAgreement(uint256 _id) public view returns (string, string, string, bool, address, uint256)"
];

// Deployed contract address from Remix or testnet
const contractAddress = "0x14294F78630842145e2615eFA96FDAc46E52fb5a";

export const uploadAgreementToBlockchain = async (fileHash, companyName, esgStatus) => {
  try {
    // Prompt MetaMask to connect
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.uploadAgreement(fileHash, companyName, esgStatus);
    await tx.wait();

    console.log("✅ Agreement uploaded:", tx.hash);
    return { success: true, txHash: tx.hash };
  } catch (err) {
    console.error("❌ Upload error:", err);
    return { success: false, error: err.message };
  }
};
