import { useEffect, useState, useRef } from "react"m "next"
import path from "path"
export default function SettingsPage() {
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [msg, setMsg] = useState("")
  const [theme, setTheme] = useState("light")), "backend/ledger/settings-history.json")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD")
  const [timeFormat, setTimeFormat] = useState("24h")
  const [profileVisible, setProfileVisible] = useState(true)
  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bio, setBio] = useState("")history = JSON.parse(fs.readFileSync(historyPath, "utf8"))
  const [socialLinks, setSocialLinks] = useState({ twitter: "", linkedin: "", github: "" })
  const [settingsHistory, setSettingsHistory] = useState([])ror: "Missing fields" })
  const [selectedHistory, setSelectedHistory] = useState(null).email === email && h.timestamp === Number(timestamp))
  const fileInputRef = useRef(null)  if (!entry) return res.status(404).json({ error: "Entry not found" })
son(entry)
  useEffect(() => {useRef } from "react"
    fetch("/api/user-settings")
      .then(res => res.json())on SettingsPage() {
      .then(data => {useState(true)
        setNotificationEnabled(data.notificationEnabled)
        setTheme(data.theme || "light")t")
        setLanguage(data.language || "en")
        setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)meFormat().resolvedOptions().timeZone)
        setDateFormat(data.dateFormat || "YYYY-MM-DD")"YYYY-MM-DD")
        setTimeFormat(data.timeFormat || "24h")
        setProfileVisible(typeof data.profileVisible === "boolean" ? data.profileVisible : true)useState(true)
        setDisplayName(data.displayName || "")eState("")
        setAvatarUrl(data.avatarUrl || "")rl] = useState("")
        setBio(data.bio || "")
        setSocialLinks(data.socialLinks || { twitter: "", linkedin: "", github: "" })[socialLinks, setSocialLinks] = useState({ twitter: "", linkedin: "", github: "" })
      })[settingsHistory, setSettingsHistory] = useState([])
  }, [])  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch("/api/settings-history"))
      .then(res => res.json())
      .then(setSettingsHistory)hen(data => {
  }, [])        setNotificationEnabled(data.notificationEnabled)
ght")
  function handleSocialChange(e) {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value })     setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  }        setDateFormat(data.dateFormat || "YYYY-MM-DD")
ormat || "24h")
  async function handleSave(e) {ble(typeof data.profileVisible === "boolean" ? data.profileVisible : true)
    e.preventDefault()
    const changes = { notificationEnabled, theme, language, timezone, dateFormat, timeFormat, profileVisible, displayName, avatarUrl, bio, socialLinks }
    const res = await fetch("/api/user-settings", {io || "")
      method: "POST","", linkedin: "", github: "" })
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes)])
    })
    await fetch("/api/settings-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes }).then(setSettingsHistory)
    })
    const data = await res.json()
    setMsg(data.ok ? "Settings updated!" : data.error)unction handleSocialChange(e) {
  }    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value })

  function handleExport() {
    window.open("/api/export-settings", "_blank")sync function handleSave(e) {
  }    e.preventDefault()
Enabled, theme, language, timezone, dateFormat, timeFormat, profileVisible, displayName, avatarUrl, bio, socialLinks }
  async function handleImport(e) {user-settings", {
    const file = e.target.files[0]
    if (!file) returnapplication/json" },
    const text = await file.text()
    const settings = JSON.parse(text)
    await fetch("/api/import-settings", {/settings-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },ation/json" },
      body: JSON.stringify({ settings })body: JSON.stringify({ changes })
    })
    setMsg("Settings imported!")son()
    window.location.reload() setMsg(data.ok ? "Settings updated!" : data.error)
  }  }

  async function showHistoryDetails(ts) {
    const res = await fetch(`/api/settings-history-details?timestamp=${ts}`)
    const data = await res.json()
    setSelectedHistory(data)
  }
 e.target.files[0]
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Settings</h1>
      <form onSubmit={handleSave} className="mb-4">-settings", {
        <label className="block font-semibold mb-1">Notification Preferences</label>: "POST",
        <label className="flex items-center mb-2">": "application/json" },
          <input.stringify({ settings })
            type="checkbox"
            checked={notificationEnabled}tings imported!")
            onChange={e => setNotificationEnabled(e.target.checked)}oad()
            className="mr-2"
          />
          Enable notifications
        </label>rounded-lg shadow p-8 mt-8">
        <label className="block font-semibold mb-1 mt-4">Theme</label> text-blue-700">Settings</h1>
        <selectmb-4">
          value={theme}/label>
          onChange={e => setTheme(e.target.value)}className="flex items-center mb-2">
          className="mb-4 px-4 py-2 border rounded w-full"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>   onChange={e => setNotificationEnabled(e.target.checked)}
        </select>
        <label className="block font-semibold mb-1 mt-4">Timezone</label>
        <inputnotifications
          type="text"
          value={timezone}t-4">Theme</label>unded w-full"
          onChange={e => setTimezone(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full"
          placeholder="e.g. America/New_York"
        />e="fr">French</option>
        <label className="block font-semibold mb-1 mt-4">Date Format</label>
        <selectvalue="light">Light</option>
          value={dateFormat}
          onChange={e => setDateFormat(e.target.value)}t> mb-1 mt-4">Timezone</label>
          className="mb-4 px-4 py-2 border rounded w-full"mibold mb-1 mt-4">Language</label>nput
        >
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option> onChange={e => setLanguage(e.target.value)}Timezone(e.target.value)}
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
        </select>
        <label className="block font-semibold mb-1 mt-4">Time Format</label>
        <select
          value={timeFormat}
          onChange={e => setTimeFormat(e.target.value)}className="block font-semibold mb-1 mt-4">Timezone</label>
          className="mb-4 px-4 py-2 border rounded w-full"arget.value)}
        >
          <option value="24h">24-hour</option>
          <option value="12h">12-hour (AM/PM)</option>ge={e => setTimezone(e.target.value)}Y-MM-DD">YYYY-MM-DD</option>
        </select>nded w-full">
        <label className="block font-semibold mb-1 mt-4">Profile Visibility</label>
        <label className="flex items-center mb-4">>
          <input
            type="checkbox"
            checked={profileVisible}{dateFormat}timeFormat}
            onChange={e => setProfileVisible(e.target.checked)}arget.value)}
            className="mr-2"
          />
          Make my profile visible to other usersY-MM-DD">YYYY-MM-DD</option>h">24-hour</option>
        </label>ption value="DD/MM/YYYY">DD/MM/YYYY</option>r (AM/PM)</option>
        <label className="block font-semibold mb-1 mt-4">Display Name</label>
        <input font-semibold mb-1 mt-4">Profile Visibility</label>
          type="text"l className="flex items-center mb-4">
          value={displayName}t
          onChange={e => setDisplayName(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full"imeFormat(e.target.value)}
          placeholder="Enter your display name"Visible(e.target.checked)}
        />
        <label className="block font-semibold mb-1 mt-4">Avatar URL</label>
        <input>
          type="url"
          value={avatarUrl}ity</label>b-1 mt-4">Display Name</label>
          onChange={e => setAvatarUrl(e.target.value)}Name="flex items-center mb-4">nput
          className="mb-4 px-4 py-2 border rounded w-full"
          placeholder="Paste an image URL"
        />
        {avatarUrl && ()}x-4 py-2 border rounded w-full"
          <img src={avatarUrl} alt="Avatar preview" className="mb-4 w-16 h-16 rounded-full border" />  className="mr-2"
        )}
        <label className="block font-semibold mb-1 mt-4">Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full" setAvatarUrl(e.target.value)}
          placeholder="Write a short bio about yourself"
        />er="Paste an image URL"
        <label className="block font-semibold mb-1 mt-4">Social Links</label>l"
        <inputplaceholder="Enter your display name"
          type="url"
          name="twitter""block font-semibold mb-1 mt-4">Avatar URL</label>
          value={socialLinks.twitter}nt-semibold mb-1 mt-4">Bio</label>
          onChange={handleSocialChange}
          className="mb-2 px-4 py-2 border rounded w-full"
          placeholder="Twitter URL".target.value)}e => setBio(e.target.value)}
        />4 px-4 py-2 border rounded w-full"
        <inputge URL"bio about yourself"
          type="url"
          name="linkedin"rUrl && (ocial Links</label>
          value={socialLinks.linkedin} alt="Avatar preview" className="mb-4 w-16 h-16 rounded-full border" />
          onChange={handleSocialChange}
          className="mb-2 px-4 py-2 border rounded w-full"emibold mb-1 mt-4">Bio</label>="twitter"
          placeholder="LinkedIn URL"
        />
        <inputrget.value)}rder rounded w-full"
          type="url"lassName="mb-4 px-4 py-2 border rounded w-full"
          name="github"eholder="Write a short bio about yourself"
          value={socialLinks.github}
          onChange={handleSocialChange}e="block font-semibold mb-1 mt-4">Social Links</label>type="url"
          className="mb-2 px-4 py-2 border rounded w-full"
          placeholder="GitHub URL"
        />
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">er}border rounded w-full"
          Save Preferencesange={handleSocialChange}
        </button>
        {msg && <div className="mt-2 text-green-700">{msg}</div>}
      </form>
      <div className="mb-4">
        <strong>Settings Change History:</strong>
        <ul>}
          {settingsHistory.map((h, idx) => (
            <li key={idx} className="text-xs">          onChange={handleSocialChange}ceholder="GitHub URL"
              <button          className="mb-2 px-4 py-2 border rounded w-full"
                className="underline text-blue-700"          placeholder="LinkedIn URL"
                type="button"        />s
                onClick={() => showHistoryDetails(h.timestamp)}        <input
              >          type="url"& <div className="mt-2 text-green-700">{msg}</div>}
                {new Date(h.timestamp).toLocaleString()}          name="github"
              </button>          value={socialLinks.github}-2">
              : {Object.keys(h.changes).join(", ")}          onChange={handleSocialChange}x-4 py-2 bg-green-700 text-white rounded" type="button" onClick={handleExport}>
            </li>          className="mb-4 px-4 py-2 border rounded w-full"
          ))}          placeholder="GitHub URL"
          {settingsHistory.length === 0 && <li className="text-xs text-gray-500">No changes yet</li>}        />nput
        </ul>        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="submit">
        {selectedHistory && (          Save Preferencestion/json"
          <div className="mb-4 p-4 bg-gray-100 rounded">        </button>leInputRef}
            <strong>Change Details ({new Date(selectedHistory.timestamp).toLocaleString()}):</strong>        {msg && <div className="mt-2 text-green-700">{msg}</div>}yle={{ display: "none" }}
            <pre className="text-xs">{JSON.stringify(selectedHistory.changes, null, 2)}</pre>      </form>onChange={handleImport}
            <button className="mt-2 px-2 py-1 bg-blue-700 text-white rounded text-xs" onClick={() => setSelectedHistory(null)}>      <div className="mb-4 flex gap-2">     />
              Close        <button className="px-4 py-2 bg-green-700 text-white rounded" type="button" onClick={handleExport}>       <button className="px-4 py-2 bg-blue-700 text-white rounded" type="button" onClick={() => fileInputRef.current.click()}>
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-green-700 text-white rounded" type="button" onClick={handleExport}>
          Export Settings
        </button>
        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="button" onClick={() => fileInputRef.current.click()}>
          Import Settings
        </button>
        <input
          ref={fileInputRef}
          type="file"








}  )    </div>      </div>        />          style={{ display: "none" }}          onChange={handleImport}          accept="application/json"












}  )    </div>      </div>        </ul>          {settingsHistory.length === 0 && <li className="text-xs text-gray-500">No changes yet</li>}          ))}            </li>              {new Date(h.timestamp).toLocaleString()}: {Object.keys(h.changes).join(", ")}            <li key={idx} className="text-xs">          {settingsHistory.map((h, idx) => (        <ul>        <strong>Settings Change History:</strong>      <div className="mb-4">      </div>        </button>          Import Settings        <button className="px-4 py-2 bg-blue-700 text-white rounded" type="button" onClick={() => fileInputRef.current.click()}>        />          onChange={handleImport}          style={{ display: "none" }}          ref={fileInputRef}          accept="application/json"          type="file"        <input        </button>          Export Settings          Import Settings
        </button>
      </div>
    </div>
  )
}