// ...existing code...

app.post('/api/withdraw/bonus', (req, res) => {
  const { founderId, amountAzr } = req.body;
  const zarAmount = amountAzr * 18;
  res.json({ withdrawnZar: zarAmount, bank: 'Standard Bank', account: 'YourAccount' });
});

// ...existing code...
