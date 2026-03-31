const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const data = await Transaction.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("GET ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ADD a transaction
router.post('/', async (req, res) => {
  try {
    console.log("Incoming POST body:", req.body);

    const { type, amount, desc, cat, date, note } = req.body;

    // Validation
    if (!type || !amount || !desc || !cat) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    const txn = new Transaction({
      type,
      amount: Number(amount), // ensure it's a number
      desc,
      cat,
      date: date ? new Date(date) : new Date(),
      note: note || ""
    });

    const savedTxn = await txn.save();
    res.status(201).json(savedTxn);

  } catch (err) {
    console.error("POST ERROR:", err.message, err.errors);
    res.status(500).json({ error: "Failed to add transaction", details: err.message });
  }
});

// DELETE one transaction
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Transaction not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: "Delete failed" });
  }
});

// CLEAR ALL transactions
router.delete('/', async (req, res) => {
  try {
    await Transaction.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error("CLEAR ERROR:", err.message);
    res.status(500).json({ error: "Clear failed" });
  }
});

module.exports = router;
