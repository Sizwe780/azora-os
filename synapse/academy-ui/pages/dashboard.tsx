import { useEffect, useState } from "react"
import Achievements from "../components/Achievements"
import Leaderboard from "../components/Leaderboard"
import Notifications from "../components/Notifications"
import StudyPlanner from "../components/StudyPlanner"
import DiscussionForumLink from "../components/DiscussionForumLink"
import VideoLecture from "../components/VideoLecture"
import DiscussionForum from "../components/DiscussionForum"
import LearningPath from "../components/LearningPath"
import AdaptiveQuiz from "../components/AdaptiveQuiz"

export default function Dashboard() {
  const [achievements, setAchievements] = useState<{ title: string; icon: string }[]>([])
  const [leaders, setLeaders] = useState<{ name: string; azr: number }[]>([])
  const [notifications, setNotifications] = useState<string[]>([])
  const [studyTasks, setStudyTasks] = useState<{ title: string; due: string }[]>([])

  useEffect(() => {
    fetch("/api/achievements").then(res => res.json()).then(setAchievements)
    fetch("/api/leaderboard").then(res => res.json()).then(setLeaders)
    fetch("/api/notifications").then(res => res.json()).then(setNotifications)
    fetch("/api/study-planner").then(res => res.json()).then(setStudyTasks)
  }, [])

  const user = { name: "Student", azrEarned: 25, progress: "80%" }

  return (
    <main>
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Dashboard</h2>
      <div className="mb-4">
        <span className="font-semibold">Welcome, {user.name}!</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Total AZR Earned:</span>
        <span className="ml-2 text-green-700 font-bold">{user.azrEarned} AZR</span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Progress:</span>
        <span className="ml-2">{user.progress}</span>
      </div>
      <Achievements achievements={achievements} />
      <Leaderboard leaders={leaders} />
      <Notifications notes={notifications} />
      <StudyPlanner tasks={studyTasks} />
      <DiscussionForumLink />
      <VideoLecture src="/videos/intro.mp4" title="Welcome to Azora Academy" />
      <DiscussionForum topic="AI/ML" />
      <LearningPath path={["Complete AI/ML Intro", "Finish Quiz", "Join Forum", "Earn AZR"]} />
      <AdaptiveQuiz questions={[
        { q: "What does AI stand for?", a: "Artificial Intelligence" },
        { q: "Who is known as the father of computer science?", a: "Alan Turing" },
      ]} />
      <a
        href="https://identity.azora.world/login"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Login with Azora Identity
      </a>
    </main>
  )
}