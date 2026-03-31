const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["income", "expense"], // optional, only these types allowed
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  desc: {
    type: String,
    required: true,
    trim: true,
  },
  cat: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: "",
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);