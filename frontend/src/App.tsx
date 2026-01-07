import React, { useState } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Detection from './components/Detection'
import About from './components/About'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-['Inter']">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main>
        {activeSection === 'home' && <Hero setActiveSection={setActiveSection} />}
        {activeSection === 'detection' && <Detection />}
        {activeSection === 'about' && <About />}
      </main>

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  )
}

export default App
