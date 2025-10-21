import { useState } from "react"
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

const programmes = [
  { id: "prog-1", title: "BSc Computer Science" },
  { id: "prog-2", title: "Advanced Diploma in AI" },
  { id: "prog-3", title: "Certificate in Blockchain" }
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({ name: "", email: "", programme: "", access: "free" })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
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
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Welcome to Azora Academy</h1>
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        className="px-4 py-2 border rounded w-full"
                        required
                      />
                    </div>
                    <button
                      className="mt-2 px-4 py-2 bg-blue-700 text-white rounded"
                      type="button"
                      onClick={() => setStep(2)}
                    >
                      Next
                    </button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Select Programme</label>
                      <select
                        name="programme"
                        value={profile.programme}
                        onChange={handleChange}
                        className="px-4 py-2 border rounded w-full"
                        required
                      >
                        <option value="">Choose...</option>
                        {programmes.map(p => (
                          <option key={p.id} value={p.title}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Access Level</label>
                      <select
                        name="access"
                        value={profile.access}
                        onChange={handleChange}
                        className="px-4 py-2 border rounded w-full"
                        required
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <button
                      className="mt-2 px-4 py-2 bg-blue-700 text-white rounded"
                      type="submit"
                    >
                      Complete Onboarding
                    </button>
                  </>
                )}
              </form>
            ) : (
              <div className="text-green-700 font-bold text-lg">
                Onboarding complete! Welcome, {profile.name}.  
                <br />
                <a href="/dashboard" className="text-blue-700 underline">Go to your dashboard</a>
              </div>
            )}
          </div>
        </MainLayout>
      </div>
    </div>
  )
}