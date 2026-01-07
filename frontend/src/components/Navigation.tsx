import React from 'react'
import { Shield } from 'lucide-react'

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'detection', label: 'Detection' },
    { id: 'about', label: 'About' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              DriveVision
            </span>
          </div>

          <div className="flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="relative group py-2 text-sm font-medium transition-colors"
              >
                <span className={activeSection === item.id ? 'text-blue-400' : 'text-slate-300 hover:text-white'}>
                  {item.label}
                </span>
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ${
                    activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
