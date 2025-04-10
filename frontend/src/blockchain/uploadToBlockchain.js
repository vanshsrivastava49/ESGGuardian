import { ethers } from "ethers";
const contractABI = [
  "function uploadAgreement(string _fileHash, string _companyName) public",
  "function getAgreement(string _fileHash) public view returns (string, string, bool, address, uint256)"
];


const contractAddress = "0x79977b975632b28c1577ccc38e1c86a181c37dab";
export const uploadAgreementToBlockchain = async (fileHash, companyName) => {
  try {
    if (!window.ethereum) {
      throw new Error("❌ MetaMask not detected.");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log("📦 Uploading to blockchain:", {
      fileHash,
      companyName
    });

    const tx = await contract.uploadAgreement(fileHash, companyName);
    console.log("📤 Transaction sent: ", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Confirmed in block:", receipt.blockNumber);

    return { success: true, txHash: tx.hash };
  } catch (err) {
    console.error("❌ Blockchain Upload Error:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
};

