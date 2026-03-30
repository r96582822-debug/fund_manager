const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  desc: String,
  cat: String,
  date: String,
  note: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);