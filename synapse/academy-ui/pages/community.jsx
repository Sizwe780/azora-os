import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function CommunityPage() {
  const [posts, setPosts] = useState([])
  const [mentors, setMentors] = useState([])
  useEffect(() => {
    fetch("/api/community").then(res => res.json()).then(data => {
      setPosts(data.posts)
      setMentors(data.mentors)
    })
  }, [])
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Community & Mentorship</h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Forum</h2>
            <ul>
              {posts.map(post => (
                <li key={post.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{post.author}</div>
                  <div className="text-gray-700">{post.content}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Mentors</h2>
            <ul>
              {mentors.map(mentor => (
                <li key={mentor.id} className="mb-4 p-4 bg-white rounded shadow">
                  <div className="font-semibold">{mentor.name}</div>
                  <div className="text-xs text-gray-600">{mentor.expertise}</div>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Request Mentorship</button>
                </li>
              ))}
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}