import { useEffect, useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function ExamSchedulingPage() {
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/exam-scheduling")
      .then(res => res.json())
      .then(setSlots)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch("/api/exam-scheduling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot: selectedSlot,
        name: studentName,
        email: studentEmail
      })
    })
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Book Your Exam Slot</h1>
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="px-4 py-2 border rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    className="px-4 py-2 border rounded w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Select Exam Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="px-4 py-2 border rounded w-full"
                    required
                  >
                    <option value="">Choose...</option>
                    {slots.map(slot => (
                      <option key={slot.id} value={slot.time}>
                        {slot.time} ({slot.available ? "Available" : "Full"})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="mt-2 px-4 py-2 bg-blue-700 text-white rounded"
                  type="submit"
                >
                  Book Slot
                </button>
              </form>
            ) : (
              <div className="text-green-700 font-bold text-lg">
                Booking complete! You will receive a confirmation email.
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}