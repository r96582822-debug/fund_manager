const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all
router.get('/', async (req, res) => {
  try {
    const data = await Transaction.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ADD
router.post('/', async (req, res) => {
  try {
    const { type, amount, desc, cat, date } = req.body;

    // ✅ VALIDATION
    if (!type || !amount || !desc || !cat) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const txn = new Transaction({
      type,
      amount,
      desc,
      cat,
      date: date || new Date().toISOString(),
      note: req.body.note || ""
    });

    await txn.save();

    res.json(txn);

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

// DELETE one
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// CLEAR ALL
router.delete('/', async (req, res) => {
  try {
    await Transaction.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Clear failed" });
  }
});

module.exports = router;