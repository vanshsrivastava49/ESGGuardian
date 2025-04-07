const Contract = require('../models/Contract');

exports.createContract = async (req, res) => {
  try {
    const { contractText, status } = req.body;
    const contract = new Contract({
      userId: req.user.id,
      contractText,
      status,
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create contract' });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user.id });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contracts' });
  }
};
