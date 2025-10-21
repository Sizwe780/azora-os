import Sidebar from "./Sidebar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* TopBar can go here if needed */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}