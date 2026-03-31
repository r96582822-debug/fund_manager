require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err.message));

// Routes
app.use('/api/transactions', require('./routes/transactions'));

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, summary } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const prompt = `
You are Flo, a smart and friendly finance assistant.

User Data:
Income: ₹${summary.totalIncome}
Expense: ₹${summary.totalExpenses}
Savings: ₹${summary.netSavings}
Savings Rate: ${summary.savingsRate}
Top Category: ${summary.topCategory}

User Question: ${message}

Give short, practical, human-like advice (2-4 lines max).
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });

  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.json({ reply: "⚠️ AI error. Check API key." });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));