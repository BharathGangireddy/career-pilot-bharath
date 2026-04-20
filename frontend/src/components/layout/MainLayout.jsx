import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function MainLayout({ children }) {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}