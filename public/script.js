// ─── STATE ───────────────────────────────
let transactions = [];
let currentType = 'expense';
let summaryMonth = new Date().getMonth();
let summaryYear  = new Date().getFullYear();

// ─── LOAD DATA FROM SERVER ───────────────
async function loadTransactions() {
  try {
    const res = await fetch('/api/transactions');
    transactions = await res.json();

    updateSidebarBalance();
    renderDashboard();
    renderHistory();
  } catch (err) {
    console.error("Error loading transactions:", err);
  }
}

// ─── HELPERS ─────────────────────────────
function fmt(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function getTotals(txns) {
  let income = 0, expense = 0;
  txns.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });
  return { income, expense, net: income - expense };
}

// ─── NAVIGATION ──────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
}

// ─── TYPE TOGGLE ─────────────────────────
function setType(type) {
  currentType = type;

  document.getElementById('btn-expense').classList.remove('active');
  document.getElementById('btn-income').classList.remove('active');

  document.getElementById(`btn-${type}`).classList.add('active');

  document.getElementById('submit-label').innerText =
    type === 'income' ? 'Add Income' : 'Add Expense';
}

// ─── ADD TRANSACTION ─────────────────────
async function addTransaction() {
  console.log("Add button clicked"); // DEBUG

  try {
    const amountEl = document.getElementById('txn-amount');
    const descEl = document.getElementById('txn-desc');
    const catEl = document.getElementById('txn-cat');
    const dateEl = document.getElementById('txn-date');
    const noteEl = document.getElementById('txn-note');
    const msgEl = document.getElementById('form-msg');

    const amount = parseFloat(amountEl.value);
    const desc = descEl.value.trim();
    const cat = catEl.value;
    const date = dateEl.value;
    const note = noteEl.value;

    // 🔴 VALIDATION
    if (!amount || amount <= 0) {
      msgEl.innerText = "⚠️ Enter valid amount";
      return;
    }

    if (!desc) {
      msgEl.innerText = "⚠️ Enter description";
      return;
    }

    if (!cat) {
      msgEl.innerText = "⚠️ Select category";
      return;
    }

    // auto date if empty
    const finalDate = date || new Date().toISOString().split('T')[0];

    const txn = {
      type: currentType,
      amount,
      desc,
      cat,
      date: finalDate,
      note
    };

    msgEl.innerText = "⏳ Adding...";

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txn)
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();
    console.log("Added:", data);

    // ✅ CLEAR FORM
    amountEl.value = '';
    descEl.value = '';
    catEl.value = '';
    noteEl.value = '';

    msgEl.innerText = "✅ Transaction added!";

    // refresh UI
    loadTransactions();

  } catch (err) {
    console.error("Add error:", err);
    document.getElementById('form-msg').innerText = "❌ Failed to add transaction";
  }
}
// ─── DELETE ─────────────────────────────
async function deleteTransaction(id) {
  await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
  loadTransactions();
}

// ─── CLEAR ALL ───────────────────────────
async function clearAll() {
  if (!confirm('Delete all?')) return;
  await fetch('/api/transactions', { method: 'DELETE' });
  loadTransactions();
}

// ─── DASHBOARD ───────────────────────────
function renderDashboard() {
  const { income, expense, net } = getTotals(transactions);

  document.getElementById('stat-income').innerText = fmt(income);
  document.getElementById('stat-expense').innerText = fmt(expense);
  document.getElementById('stat-net').innerText = fmt(net);

  const rate = income > 0 ? ((net/income)*100).toFixed(1) : 0;
  document.getElementById('savings-rate').innerText = `${rate}% savings rate`;
}

function updateSidebarBalance() {
  const { net } = getTotals(transactions);
  document.getElementById('sidebar-net').innerText = fmt(net);
}

// ─── HISTORY ─────────────────────────────
function renderHistory() {
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  transactions.forEach(t => {
    const div = document.createElement('div');
    div.className = 'txn-item';

    div.innerHTML = `
      <span>${t.desc}</span>
      <span>${fmt(t.amount)}</span>
      <button onclick="deleteTransaction('${t._id}')">❌</button>
    `;

    container.appendChild(div);
  });
}

// ─── CHAT ───────────────────────────────
function toggleChat() {
  document.getElementById('chat-panel').classList.toggle('open');
}

function appendMessage(sender, text) {
  const container = document.getElementById('chat-messages');

  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;

  msg.innerHTML = `
    <div class="msg-bubble">${text}</div>
    <div class="msg-time">${new Date().toLocaleTimeString()}</div>
  `;

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function getFinanceSummary() {
  const { income, expense, net } = getTotals(transactions);

  return {
    totalIncome: income,
    totalExpenses: expense,
    netSavings: net,
    savingsRate: income > 0 ? ((net/income)*100).toFixed(1)+'%' : 'N/A',
    topCategory: 'N/A'
  };
}

async function sendChat() {
  try {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage('user', text);

    const summary = getFinanceSummary();

    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message:text, summary })
    });

    const data = await res.json();
    appendMessage('bot', data.reply);

  } catch (err) {
    console.error("Chat error:", err);
    appendMessage('bot', "⚠️ Error connecting to AI");
  }
}

// ─── INIT ───────────────────────────────
(function init() {
  document.getElementById('txn-date').value =
    new Date().toISOString().split('T')[0];

  loadTransactions();
})();

// ─── SIDEBAR BUTTON FIX ─────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.getAttribute('data-page');
    navigate(page);
  });
});