import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function Dashboard() {
  const [progress, setProgress] = useState({ completed: [], score: 0 })
  const [examAnalytics, setExamAnalytics] = useState(null)
  const [user, setUser] = useState({ name: "", access: "free", role: "student" })
  const [roleRequests, setRoleRequests] = useState([])
  const [roleHistory, setRoleHistory] = useState([])
  const [notifCount, setNotifCount] = useState(0)
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("")
  const [timeFormat, setTimeFormat] = useState("24h")
  const router = useRouter()
  const [pwMsg, setPwMsg] = useState("")
  const [profileVisible, setProfileVisible] = useState(true)
  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bio, setBio] = useState("")
  const [socialLinks, setSocialLinks] = useState({})

  useEffect(() => {
    fetch("/api/professor-progress")
      .then(res => res.json())
      .then(setProgress)
    fetch("/api/pass-exam-analytics")
      .then(res => res.json())
      .then(setExamAnalytics)
  }, [])

  useEffect(() => {
    fetch("/api/onboarding")
      .then(res => res.json())
      .then(data => {
        // Assume last onboarded user is current for demo
        if (Array.isArray(data) && data.length > 0) setUser(data[data.length - 1])
      })
  }, [])

  useEffect(() => {
    fetch("/api/auth-session")
      .then(res => res.json())
      .then(data => { if (data.email) setUser(data) })
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/api/student-requests").then(res => res.json()),
      fetch("/api/alumni-requests").then(res => res.json()),
      fetch("/api/employer-requests").then(res => res.json())
    ]).then(([student, alumni, employer]) => {
      setRoleRequests([
        ...student.filter(r => r.email === user.email),
        ...alumni.filter(r => r.email === user.email),
        ...employer.filter(r => r.email === user.email)
      ])
    })
  }, [user.email])

  useEffect(() => {
    fetch("/api/role-history")
      .then(res => res.json())
      .then(setRoleHistory)
  }, [])

  useEffect(() => {
    if (router.query.pwChanged) setPwMsg("Password changed successfully!")
  }, [router.query])

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => setNotifCount(data.filter(n => !n.read).length))
  }, [])

  useEffect(() => {
    fetch("/api/user-settings")
      .then(res => res.json())
      .then(data => {
        setLanguage(data.language || "en")
        setTimezone(data.timezone || "")
        setTimeFormat(data.timeFormat || "24h")
        setProfileVisible(typeof data.profileVisible === "boolean" ? data.profileVisible : true)
        setDisplayName(data.displayName || "")
        setAvatarUrl(data.avatarUrl || "")
        setBio(data.bio || "")
        setSocialLinks(data.socialLinks || {})
      })
  }, [])

  function roleColor(role) {
    if (role === "admin") return "bg-red-700";
    if (role === "employer") return "bg-purple-700";
    if (role === "alumni") return "bg-green-700";
    return "bg-blue-700";
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Your Learning Dashboard</h1>
            <div className="mb-4 font-semibold text-lg text-gray-800">
              Lessons completed: {progress.completed.length}/50
            </div>
            <div className="mb-4 font-semibold text-green-700">
              Total Score: {progress.score}
            </div>
            <div className="mb-4 font-semibold text-lg text-gray-800">
              Welcome, {user.name || user.email} ({user.role})
              <span className={`ml-2 px-2 py-1 rounded text-white text-xs ${roleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div className="mb-4"><strong>Email:</strong> {user.email}</div>
            {user.access === "premium" && examAnalytics && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 text-purple-700">Premium Exam Mastery</h2>
                <div>Total Attempts: {examAnalytics.totalAttempts}</div>
                <div>Average Score: {examAnalytics.avgScore}</div>
                <div>Mastery Rate: {examAnalytics.masteryPercent}%</div>
                <a
                  href="/pass-exam-analytics"
                  className="mt-2 inline-block px-4 py-2 bg-blue-700 text-white rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full Exam Analytics
                </a>
              </div>
            )}
            <div className="mb-4">
              <strong>Role Requests:</strong>
              <ul>
                {roleRequests.map((r, idx) => (
                  <li key={idx} className="text-sm">{r.status} ({r.email})</li>
                ))}
                {roleRequests.length === 0 && <li className="text-sm text-gray-500">No pending requests</li>}
              </ul>
            </div>
            <div className="mb-4">
              <strong>Role History:</strong>
              <ul>
                {roleHistory.map((h, idx) => (
                  <li key={idx} className="text-sm">
                    {h.newRole} ({new Date(h.timestamp).toLocaleString()})
                  </li>
                ))}
                {roleHistory.length === 0 && <li className="text-sm text-gray-500">No role changes</li>}
              </ul>
            </div>
            <div className="mb-4">
              <strong>Notifications:</strong> {notificationEnabled ? "Enabled" : "Disabled"}
            </div>
            <div className="mb-4">
              <strong>Theme:</strong> {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </div>
            <div className="mb-4">
              <strong>Language:</strong> {language.toUpperCase()}
            </div>
            <div className="mb-4">
              <strong>Timezone:</strong> {timezone}
            </div>
            <div className="mb-4">
              <strong>Time Format:</strong> {timeFormat === "24h" ? "24-hour" : "12-hour (AM/PM)"}
            </div>
            <div className="mb-4">
              <strong>Profile Visibility:</strong> {profileVisible ? "Visible" : "Hidden"}
            </div>
            <div className="mb-4">
              <strong>Display Name:</strong> {displayName || user.email}
            </div>
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" className="mb-4 w-16 h-16 rounded-full border" />
            )}
            {bio && (
              <div className="mb-4">
                <strong>Bio:</strong> {bio}
              </div>
            )}
            {socialLinks && (
              <div className="mb-4">
                <strong>Social Links:</strong>
                <ul>
                  {socialLinks.twitter && <li><a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a></li>}
                  {socialLinks.linkedin && <li><a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
                  {socialLinks.github && <li><a href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
                </ul>
              </div>
            )}
            <div className="mb-4">
              <a href="/notifications" className="px-4 py-2 bg-yellow-500 text-white rounded">
                Notifications {notifCount > 0 && <span className="ml-2 bg-red-700 px-2 py-1 rounded text-xs">{notifCount}</span>}
              </a>
            </div>
            {user.deactivated && (
              <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded">
                Your account is currently deactivated. Please contact support.
              </div>
            )}
            {user.locked && (
              <div className="mb-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded">
                Your account is currently locked. Please contact support.
              </div>
            )}
            {!user.locked && (
              <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded">
                Your account is unlocked and active.
              </div>
            )}
            {pwMsg && <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded">{pwMsg}</div>}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}