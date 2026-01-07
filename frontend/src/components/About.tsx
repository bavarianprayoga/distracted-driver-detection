import React from 'react'
import { Brain, Car, Zap } from 'lucide-react'

const About: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Computer Vision',
      description: 'Feature extraction from images and videos to identify distracted driving behavior'
    },
    {
      icon: Car,
      title: 'Driver Safety',
      description: 'Real-time analysis of driver behavior to prevent accidents and improve road safety'
    },
    {
      icon: Zap,
      title: 'Fast Analysis',
      description: 'Efficient processing with SVM classification for quick and reliable results'
    }
  ]

  return (
    <section className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            About the System
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            This system applies computer vision feature extraction and SVM-based classification to identify distracted driving behavior from visual data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl hover:bg-slate-900/50 transition-all duration-300 hover:scale-105 hover:border-blue-500/50"
            >
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                {React.createElement(feature.icon, {
                  className: 'w-8 h-8 text-blue-400'
                })}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl">
          <h3 className="text-2xl font-bold mb-6 text-white">How It Works</h3>
          <div className="space-y-6 text-slate-300">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Upload Media</h4>
                <p className="text-slate-400">Upload an image or video of a driver from your device</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Feature Analysis</h4>
                <p className="text-slate-400">Visual features are extracted and classified using SVM</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Get Results</h4>
                <p className="text-slate-400">Distraction status and confidence score are displayed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              64.20%
            </div>
            <div className="text-slate-400">Detection Accuracy</div>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {'<'}3s
            </div>
            <div className="text-slate-400">Processing Time</div>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              5+
            </div>
            <div className="text-slate-400">Behavior Types</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
