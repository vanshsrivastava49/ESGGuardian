const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contractText: String,
  status: String,
});

module.exports = mongoose.model('Contract', contractSchema);