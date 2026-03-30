const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all
router.get('/', async (req, res) => {
  const data = await Transaction.find().sort({ createdAt: -1 });
  res.json(data);
});

// ADD
router.post('/', async (req, res) => {
  const txn = new Transaction(req.body);
  await txn.save();
  res.json(txn);
});

// DELETE one
router.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// CLEAR ALL
router.delete('/', async (req, res) => {
  await Transaction.deleteMany({});
  res.json({ success: true });
});

module.exports = router;