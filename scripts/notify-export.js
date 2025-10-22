/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")
const https = require("https")

const prefsPath = path.resolve(process.cwd(), "backend/exports/admin-notification-preferences.json")
const auditPath = path.resolve(process.cwd(), "backend/exports/notification-audit.json")
const adminEmail = "admin@azora.local"
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
const smsApiUrl = process.env.SMS_API_URL
const smsApiKey = process.env.SMS_API_KEY
const adminPhone = process.env.ADMIN_PHONE

function getPrefs() {
  let prefs = { email: true, slack: false, sms: false }
  try {
    if (fs.existsSync(prefsPath)) {
      prefs = JSON.parse(fs.readFileSync(prefsPath, "utf8"))
    }
  } catch {}
  return prefs
}

function logAudit(channel, status, details) {
  let audit = []
  try {
    if (fs.existsSync(auditPath)) {
      audit = JSON.parse(fs.readFileSync(auditPath, "utf8"))
    }
  } catch {}
  audit.push({
    channel,
    status,
    details,
    timestamp: Date.now()
  })
  fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2), "utf8")
}

function sendEmail(subject, body) {
  try {
    execSync(`echo "${body}" | mail -s "${subject}" ${adminEmail}`)
    logAudit("email", "sent", { subject, to: adminEmail })
    console.log(`Email sent to ${adminEmail}`)
  } catch (err) {
    logAudit("email", "failed", { subject, to: adminEmail, error: err.message })
    console.error("Email failed:", err.message)
  }
}

function sendSlack(body) {
  if (!slackWebhookUrl) return
  const data = JSON.stringify({ text: body })
  const url = new URL(slackWebhookUrl)
  const req = https.request({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": data.length }
  }, res => {
    res.on("data", () => {})
    logAudit("slack", "sent", { body })
  })
  req.on("error", err => {
    logAudit("slack", "failed", { body, error: err.message })
    console.error("Slack failed:", err.message)
  })
  req.write(data)
  req.end()
}

function sendSMS(body) {
  if (!smsApiUrl || !smsApiKey || !adminPhone) return
  const data = JSON.stringify({ to: adminPhone, message: body })
  const url = new URL(smsApiUrl)
  const req = https.request({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
      "Authorization": `Bearer ${smsApiKey}`
    }
  }, res => {
    res.on("data", () => {})
    logAudit("sms", "sent", { to: adminPhone, body })
  })
  req.on("error", err => {
    logAudit("sms", "failed", { to: adminPhone, body, error: err.message })
    console.error("SMS failed:", err.message)
  })
  req.write(data)
  req.end()
}

function notifyAll(subject, body) {
  const prefs = getPrefs()
  if (prefs.email) sendEmail(subject, body)
  if (prefs.slack) sendSlack(`*${subject}*\n${body}`)
  if (prefs.sms) sendSMS(`${subject}: ${body}`)
}

module.exports = { notifyAll }