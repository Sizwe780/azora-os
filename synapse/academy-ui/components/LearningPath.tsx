export default function LearningPath({ path }: { path: string[] }) {
  if (!path.length) return null
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-blue-700">Your Learning Path</h3>
      <ol className="list-decimal ml-6">
        {path.map((step, i) => (
          <li key={i} className="mb-1">{step}</li>
        ))}
      </ol>
    </section>
  )
}