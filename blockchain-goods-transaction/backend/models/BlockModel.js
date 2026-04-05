const mongoose = require('../db');

const BlockSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  vehicle: String,
  goods: String,
  quantity: Number,
  transportCost: Number,
  paymentAmount: Number,
  receivedPayment: Number,
  gasUsed: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  previousHash: String,
  currentHash: String,
  timestamp: String
});

module.exports = mongoose.model('Block', BlockSchema);
