require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const MAIN_FOUNDER_EMAIL = process.env.MAIN_FOUNDER_EMAIL || "sizwe.ngwenya@azora.world";

// Fixed allocations for founders
const ONBOARD_AMOUNTS = {
  main_founder: 100000,
  founder: 1000
};
// Rand values for other roles
const ONBOARD_RANDS = {
  premium: 50,
  student: 25,
  free: 5
};
const MINT_EFFICIENCY = {
  main_founder: 1,
  founder: 1,
  premium: 1,
  student: 0.5,
  free: 0.3
};

// Minimums for withdrawals
const MIN_AIRTIME_DOLLARS = Number(process.env.MIN_AIRTIME_DOLLARS) || 5;
const MIN_CASHOUT_DOLLARS = Number(process.env.MIN_CASHOUT_DOLLARS) || 50;

// Utility to get USD/ZAR exchange rate
async function getUsdZarRate() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    return data.rates.ZAR || 19.0;
  } catch {
    return 19.0;
  }
}

function isMainFounder(email) {
  return email === MAIN_FOUNDER_EMAIL;
}
function isOtherFounder(email) {
  return (
    email.endsWith('@azora.world') &&
    /^[a-zA-Z]+\.[a-zA-Z]+@azora\.world$/.test(email) &&
    email !== MAIN_FOUNDER_EMAIL
  );
}
function isPremium(email) {
  return email.endsWith('@azora.world') && !isOtherFounder(email) && !isMainFounder(email);
}
function isStudent(email) {
  return /@.*\.ac\.za$|@.*\.edu$/.test(email);
}

let balances = {};
let roles = {};

app.post('/api/azora-coin/onboard', async (req, res) => {
  const { email } = req.body;
  if (balances[email]) return res.json({ balance: balances[email], role: roles[email] });

  let balance = 0;
  let role = "free";
  if (isMainFounder(email)) {
    balance = ONBOARD_AMOUNTS.main_founder;
    role = "main_founder";
  } else if (isOtherFounder(email)) {
    balance = ONBOARD_AMOUNTS.founder;
    role = "founder";
  } else if (isPremium(email)) {
    const rate = await getUsdZarRate();
    balance = Math.round(ONBOARD_RANDS.premium / rate);
    role = "premium";
  } else if (isStudent(email)) {
    const rate = await getUsdZarRate();
    balance = Math.round(ONBOARD_RANDS.student / rate);
    role = "student";
  } else {
    const rate = await getUsdZarRate();
    balance = Math.round(ONBOARD_RANDS.free / rate);
    role = "free";
  }
  balances[email] = balance;
  roles[email] = role;
  res.json({ balance, role });
});

// Mint coins for activity, with efficiency per role
app.post('/api/azora-coin/mint', (req, res) => {
  const { email, amount, reason } = req.body;
  if (!balances[email]) return res.status(404).json({ error: "User not found" });
  const role = roles[email] || "free";
  const efficiency = MINT_EFFICIENCY[role] || 0.3;
  const minted = Math.floor(amount * efficiency);
  balances[email] += minted;
  res.json({ balance: balances[email], minted, efficiency, role, reason });
});

app.get('/api/azora-coin/wallet/:email', (req, res) => {
  res.json({ balance: balances[req.params.email] || 0, role: roles[req.params.email] || "none" });
});

// Instant withdrawal endpoint (no minimums, instant processing)
app.post('/api/azora-coin/withdraw', (req, res) => {
  const { email, amount, method, account } = req.body;
  if (!balances[email] || balances[email] < amount) return res.status(400).json({ error: "Insufficient balance" });
  balances[email] -= amount;
  // TODO: Integrate with payment or airtime API here for real payout
  res.json({ withdrawn: amount, method, account, instant: true });
});

app.listen(6700, () => console.log("[azora-coin] running on 6700"));