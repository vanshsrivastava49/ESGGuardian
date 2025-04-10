import { ethers } from "ethers";
import ESGAgreementStorageABI from "../abi/ESGAgreementStorage.json";

const CONTRACT_ADDRESS = "0x79977b975632b28c1577ccc38e1c86a181c37dab";

export const getAgreementByFileHash = async (fileHash) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ESGAgreementStorageABI, signer);

    const agreement = await contract.getAgreement(fileHash);
    return {
      fileHash: agreement[0],
      companyName: agreement[1],
      validated: agreement[2],
      uploader: agreement[3],
      timestamp: agreement[4].toString(),
    };
  } catch (err) {
    throw new Error("Failed to fetch agreement from blockchain.");
  }
};
