import React from 'react'
import { Upload, BookOpen, Sparkles } from 'lucide-react'

interface HeroProps {
  setActiveSection: (section: string) => void
}

const Hero: React.FC<HeroProps> = ({ setActiveSection }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>Computer Vision–Based Safety System</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Presenting
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Distracted Driver
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Detection
            </span>
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
            Detect unsafe driving behavior from images and videos using computer vision and SVM-based classification to enhance road safety.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveSection('detection')}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Media
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => setActiveSection('about')}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl font-semibold text-white hover:bg-slate-800 transition-all duration-300 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Learn More
            </button>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative z-10">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop" 
              alt="Driver monitoring"
              className="w-full h-auto"
            />
            
            {/* AI Detection Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
            
            {/* Bounding Box 1 - Phone Usage */}
            <div className="absolute top-1/3 right-1/4 w-32 h-32 border-2 border-red-500 rounded-lg animate-pulse">
              <div className="absolute -top-8 left-0 px-3 py-1 bg-red-500 rounded-md text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                Phone Usage
              </div>
            </div>

            {/* Bounding Box 2 - Face Detection */}
            <div className="absolute top-1/4 left-1/3 w-24 h-32 border-2 border-amber-500 rounded-lg">
              <div className="absolute -top-8 left-0 px-3 py-1 bg-amber-500 rounded-md text-xs font-semibold">
                Looking Away
              </div>
            </div>

            {/* AI Analysis Badge */}
            <div className="absolute bottom-6 left-6 px-4 py-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-xs text-slate-400">Analysis</div>
                  <div className="text-sm font-semibold">Processing...</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -bottom-6 -right-6 px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-xl shadow-xl">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              64.20%
            </div>
            <div className="text-sm text-slate-400">Detection Accuracy</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
