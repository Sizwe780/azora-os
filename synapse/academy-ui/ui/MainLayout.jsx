import QuickNav from "./QuickNav"

export default function MainLayout({ children }) {
  return (
    <main>
      <QuickNav />
      <div>{children}</div>
    </main>
  )
}