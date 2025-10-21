import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function NotificationAuditPage() {
  const [audit, setAudit] = useState([])
  const [filter, setFilter] = useState({ channel: "", status: "", date: "", search: "", tag: "" })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [modal, setModal] = useState(null)
  const pageSize = 50

  useEffect(() => {
    fetch("/api/notification-audit")
      .then(res => res.json())
      .then(setAudit)
  }, [])

  function handleChange(e) {
    setFilter({ ...filter, [e.target.name]: e.target.value })
  }

  const filtered = audit.filter(entry => {
    const matchesChannel = filter.channel ? entry.channel === filter.channel : true
    const matchesStatus = filter.status ? entry.status === filter.status : true
    const matchesDate = filter.date
      ? new Date(entry.timestamp).toISOString().slice(0, 10) === filter.date
      : true
    const matchesSearch = filter.search
      ? JSON.stringify(entry.details).toLowerCase().includes(filter.search.toLowerCase())
      : true
    const matchesTag = filter.tag ? entry.tag === filter.tag : true
    return matchesChannel && matchesStatus && matchesDate && matchesSearch && matchesTag
  })

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  function exportCSV() {
    const headers = ["Channel", "Status", "Timestamp", "Details"]
    const rows = filtered.map(entry => [
      entry.channel,
      entry.status,
      new Date(entry.timestamp).toISOString(),
      JSON.stringify(entry.details)
    ])
    const csv =
      [headers.join(","), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notification-audit-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportAllCSV() {
    const headers = ["Channel", "Status", "Timestamp", "Details"]
    const rows = audit.map(entry => [
      entry.channel,
      entry.status,
      new Date(entry.timestamp).toISOString(),
      JSON.stringify(entry.details)
    ])
    const csv =
      [headers.join(","), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notification-audit-all-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportTaggedCSV() {
    const tagged = filtered.filter(e => e.tag)
    const headers = ["Channel", "Status", "Timestamp", "Details", "Tag"]
    const rows = tagged.map(entry => [
      entry.channel,
      entry.status,
      new Date(entry.timestamp).toISOString(),
      JSON.stringify(entry.details),
      entry.tag
    ])
    const csv =
      [headers.join(","), ...rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notification-audit-tagged-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleSelect(idx) {
    setSelected(selected.includes(idx)
      ? selected.filter(i => i !== idx)
      : [...selected, idx])
  }

  async function handleBulkDelete() {
    await fetch("/api/notification-audit-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indices: selected })
    })
    setSelected([])
    window.location.reload()
  }

  async function handleRestore() {
    await fetch("/api/notification-audit-restore", { method: "POST" })
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Notification Audit Log</h1>
            <form className="mb-6 flex flex-wrap gap-4">
              <select name="channel" value={filter.channel} onChange={handleChange} className="px-2 py-1 border rounded">
                <option value="">All Channels</option>
                <option value="email">Email</option>
                <option value="slack">Slack</option>
                <option value="sms">SMS</option>
              </select>
              <select name="status" value={filter.status} onChange={handleChange} className="px-2 py-1 border rounded">
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
              <input
                type="date"
                name="date"
                value={filter.date}
                onChange={handleChange}
                className="px-2 py-1 border rounded"
              />
              <input
                type="text"
                name="search"
                value={filter.search}
                onChange={handleChange}
                placeholder="Search details"
                className="px-2 py-1 border rounded flex-1"
              />
              <select name="tag" value={filter.tag || ""} onChange={handleChange} className="px-2 py-1 border rounded">
                <option value="">All Tags</option>
                {[...new Set(audit.map(e => e.tag).filter(Boolean))].map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </form>
            <button
              className="mb-4 px-4 py-2 bg-blue-700 text-white rounded"
              onClick={exportCSV}
            >
              Export Filtered Audit Log (CSV)
            </button>
            <button
              className="mb-4 px-4 py-2 bg-green-700 text-white rounded"
              onClick={exportAllCSV}
            >
              Export All Audit Logs (CSV)
            </button>
            <button
              className="mb-4 px-4 py-2 bg-purple-700 text-white rounded"
              onClick={exportTaggedCSV}
            >
              Export Tagged Entries (CSV)
            </button>
            <button
              className="mb-4 px-4 py-2 bg-red-700 text-white rounded"
              disabled={selected.length === 0}
              onClick={handleBulkDelete}
            >
              Delete Selected Entries
            </button>
            <button
              className="mb-4 px-4 py-2 bg-yellow-600 text-white rounded"
              onClick={handleRestore}
            >
              Restore Last Backup
            </button>
            <ul>
              {paginated.map((entry, idx) => (
                <li key={idx} className="mb-2 p-2 bg-white rounded shadow flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes((page - 1) * pageSize + idx)}
                    onChange={() => handleSelect((page - 1) * pageSize + idx)}
                    className="mr-2"
                  />
                  <span className="font-semibold">{entry.channel.toUpperCase()}</span>
                  <span className="ml-4">{entry.status}</span>
                  <span className="ml-4 text-xs text-gray-600">{new Date(entry.timestamp).toLocaleString()}</span>
                  <span className="ml-4 text-xs text-gray-600">{JSON.stringify(entry.details)}</span>
                  <span
                    className="ml-4 text-xs text-blue-700 underline cursor-pointer"
                    onClick={() => setModal(entry)}
                  >
                    View Details
                  </span>
                </li>
              ))}
            </ul>
            {modal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded shadow p-6 max-w-lg">
                  <h2 className="text-xl font-bold mb-4">Audit Entry Details</h2>
                  <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(modal, null, 2)}</pre>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-700 text-white rounded"
                    onClick={() => setModal(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >Prev</button>
              <span>Page {page}</span>
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                disabled={page * pageSize >= filtered.length}
                onClick={() => setPage(page + 1)}
              >Next</button>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}