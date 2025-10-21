import { useEffect, useState } from "react"

export default function Wallet() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetch("/api/wallet/balance")
      .then(res => res.json())
      .then(data => setBalance(data.balance))
    fetch("/api/wallet/transactions")
      .then(res => res.json())
      .then(setTransactions)
  }, [])

  return (
    <main>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Your Wallet</h2>
      <div className="mb-4 font-bold text-green-700">AZR Balance: {balance}</div>
      <h3 className="font-bold text-lg mb-2 text-blue-700">Recent Transactions</h3>
      <ul>
        {transactions.map((tx: any) => (
          <li key={tx.id} className="mb-2 p-2 bg-gray-50 rounded border">
            <span>{tx.type}: {tx.amount} AZR</span>
            <span className="ml-2 text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}