export default function QuickNav() {
  return (
    <nav className="flex gap-4 p-4 bg-gray-100 rounded">
      <a href="/" className="text-blue-700 underline">Home</a>
      <a href="/dashboard" className="text-blue-700 underline">Dashboard</a>
      <a href="/course-catalogue" className="text-blue-700 underline">Courses</a>
      <a href="/job-marketplace" className="text-blue-700 underline">Jobs</a>
      <a href="/help" className="text-blue-700 underline">Help</a>
      <a href="/about" className="text-blue-700 underline">About</a>
      <a href="/profile" className="text-blue-700 underline">Profile</a>
      <a href="/activity-log" className="text-blue-700 underline">Activity Log</a>
      <a href="/notifications" className="text-blue-700 underline">Notifications</a>
      <a href="/notification-settings" className="text-blue-700 underline">Notification Settings</a>
      <a href="/settings" className="text-blue-700 underline">Settings</a>
    </nav>
  )
}