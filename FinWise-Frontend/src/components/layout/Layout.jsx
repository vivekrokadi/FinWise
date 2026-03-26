import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useState } from 'react'

const Layout = () => {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* 
          lg:ml-64 pushes main content right by exactly the sidebar width (w-64 = 256px)
          on desktop so the fixed sidebar never overlaps the content.
          On mobile the sidebar floats over content (intended overlay behaviour).
        */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-6 lg:p-8 mt-16 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout