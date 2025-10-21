import fs from "fs"
import path from "path"
import { useEffect, useState } from "react"
import MainLayout from "../components/MainLayout"

export default function ConstitutionPage() {
  const [text, setText] = useState("")

  useEffect(() => {
    fetch("/api/constitution")
      .then(res => res.text())
      .then(setText)
  }, [])

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Azora Constitution</h1>
      <pre className="bg-white p-6 rounded shadow overflow-x-auto text-sm">{text}</pre>
    </MainLayout>
  )
}