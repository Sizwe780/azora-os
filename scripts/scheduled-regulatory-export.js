/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")
const { notifyAll } = require("./notify-export")

const blockchainPath = path.resolve(process.cwd(), "backend/ledger/azora-blockchain.json")
const exportDir = path.resolve(process.cwd(), "backend/exports")
const exportFile = path.join(exportDir, `regulatory-report-${Date.now()}.csv`)
const adminEmail = "admin@azora.local" // Set your admin email here

function generateTemplate(events) {
  return [
    "Event Type,Timestamp,Key,Details",
    ...events.map(e =>
      [
        e.type,
        e.timestamp ? new Date(e.timestamp).toISOString() : "",
        e.key ?? "",
        JSON.stringify(e.payload ?? e.details ?? {})
      ].map(v => `"${v.replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n")
}

function runExport() {
  if (!fs.existsSync(blockchainPath)) {
    console.error("No blockchain data found.")
    process.exit(1)
  }
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }
  const chain = JSON.parse(fs.readFileSync(blockchainPath, "utf8"))
  const events = chain.chain?.map(b => b.entries).flat() ?? []
  const csv = generateTemplate(events)
  fs.writeFileSync(exportFile, csv, "utf8")
  console.log(`Regulatory report exported: ${exportFile}`)
  const subject = "Azora Regulatory Report Exported"
  const body = `A new regulatory report has been exported:\n${exportFile}\nTimestamp: ${new Date().toISOString()}`
  notifyAll(subject, body)
}

runExport()