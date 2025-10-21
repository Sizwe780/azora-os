import { useEffect, useState } from "react"
import MainLayout from "../components/MainLayout"
import NavBar from "../components/NavBar"
import { Qualification } from "../data/qualifications"

export default function QualificationsPage() {
  const [items, setItems] = useState<Qualification[]>([])

  useEffect(() => {
    fetch("/api/qualifications")
      .then(res => res.json())
      .then(setItems)
  }, [])

  return (
    <MainLayout>
      <main className="px-8 py-6">
        <NavBar />
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Azora Academy Qualifications</h1>
        <p className="mb-6 text-gray-700">
          All programs are transparent: NQF level, credits, learning outcomes, assessment structure and exam eligibility are provided for DHET/SAQA audit and for learners who want to sit university-equivalent exams.
        </p>

        <div className="space-y-6">
          {items.map(q => (
            <section key={q.id} className="p-6 bg-white rounded shadow border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{q.title}</h2>
                  <div className="text-sm text-gray-600">ID: {q.id} • SAQA: {q.saqaId}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-700">NQF {q.level}</div>
                  <div className="text-sm">{q.credits} credits</div>
                  <div className="text-sm mt-2 text-blue-700">{q.aiProfessor.name}</div>
                </div>
              </div>

              <p className="mt-4 text-gray-700">{q.description}</p>

              <div className="mt-4">
                <div className="font-semibold">Learning Outcomes</div>
                <ul className="list-disc ml-6">
                  {q.outcomes.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>

              <div className="mt-4">
                <div className="font-semibold">Modules</div>
                <ul className="list-disc ml-6">
                  {q.modules.map(m => (
                    <li key={m.code}>
                      <strong>{m.code}</strong>: {m.title} — {m.credits}cr — Instructor: {m.professor} — Assessment: {m.assessment.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-semibold">Assessment</div>
                  <div>Coursework: {q.assessmentStructure.courseworkPercent}%</div>
                  <div>Exams: {q.assessmentStructure.examPercent}%</div>
                  {q.assessmentStructure.capstone && <div>Includes Capstone</div>}
                </div>

                <div>
                  <div className="font-semibold">Exam Eligibility</div>
                  <div>External Exams: {q.examEligibility.externalExamEligible ? "Yes" : "No"}</div>
                  <div className="text-sm text-gray-600 mt-1">{q.examEligibility.howToSitExternalExam}</div>
                </div>

                <div>
                  <div className="font-semibold">Recognition</div>
                  <div className="text-sm text-gray-600">{q.recognitionNotes}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-semibold">Delivery</div>
                <div>{q.deliveryModes.join(", ")}</div>
                {q.prerequisites && q.prerequisites.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">Prerequisites: {q.prerequisites.join(", ")}</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </MainLayout>
  )
}