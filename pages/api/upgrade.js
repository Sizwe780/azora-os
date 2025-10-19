export default async function handler(req, res) {
  const { email, coins, privilege } = req.body;
  const response = await fetch('http://localhost:6700/api/azora-coin/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, coins, privilege })
  });
  const data = await response.json();
  res.status(200).json(data);
}