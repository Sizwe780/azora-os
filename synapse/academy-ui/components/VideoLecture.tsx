export default function VideoLecture({ src, title }: { src: string; title: string }) {
  return (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-2 text-blue-700">{title}</h3>
      <video controls width="100%" className="rounded shadow">
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  )
}