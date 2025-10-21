export default function DiscussionForum({ topic }: { topic: string }) {
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-purple-700">Discussion Forum: {topic}</h3>
      <a
        href={`https://community.azora.world/forum/${encodeURIComponent(topic)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
      >
        Join the Conversation
      </a>
    </section>
  )
}