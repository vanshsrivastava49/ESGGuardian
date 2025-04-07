import { ethers } from "ethers";
const contractABI = [
  "function uploadAgreement(string _fileHash, string _companyName, string _esgStatus) public",
  "function getAgreement(uint256 _id) public view returns (string, string, string, bool, address, uint256)"
];
const contractAddress = "0xcD6a42782d230D7c13A74ddec5dD140e55499Df9";
export const uploadAgreementToBlockchain = async (fileHash, companyName, esgStatus) => {
  try {
    if (!window.ethereum) {
      throw new Error("❌ MetaMask not detected.");
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.uploadAgreement(fileHash, companyName, esgStatus);
    console.log("📤 Transaction sent: ", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Confirmed in block:", receipt.blockNumber);
    return { success: true, txHash: tx.hash };
  } catch (err) {
    console.error("❌ Blockchain Upload Error:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
};