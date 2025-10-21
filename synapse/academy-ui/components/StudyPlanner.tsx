import { useState } from "react"

type Task = { title: string; due: string; done?: boolean }

export default function StudyPlanner({ tasks }: { tasks: Task[] }) {
  const [taskList, setTaskList] = useState(tasks)

  function toggleDone(idx: number) {
    setTaskList(list =>
      list.map((t, i) => i === idx ? { ...t, done: !t.done } : t)
    )
  }

  if (!taskList.length) return null

  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-blue-700">Study Planner</h3>
      <ul>
        {taskList.map((t, i) => (
          <li key={i} className="flex justify-between py-1 border-b items-center">
            <span className={t.done ? "line-through text-gray-400" : ""}>{t.title}</span>
            <span className="text-gray-500 mr-2">Due: {t.due}</span>
            <button
              onClick={() => toggleDone(i)}
              className={`px-2 py-1 rounded ${t.done ? "bg-green-400" : "bg-gray-200"}`}
            >
              {t.done ? "Done" : "Mark Done"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}