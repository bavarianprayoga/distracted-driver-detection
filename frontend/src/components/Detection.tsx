import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react'

interface BackendResponse {
  class_id: number
  label: string
  confidence: number | null
}

interface DetectionResult {
  label: string
  status: 'safe' | 'distracted'
  confidence: number | null
}

type FileType = 'image' | 'video' | null

const Detection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<FileType>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  
  // Video-specific state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analysisIntervalRef = useRef<number | null>(null)

  // ======================
  // FILE HANDLING
  // ======================
  const processFile = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)
    stopVideoAnalysis()

    const isVideo = selectedFile.type.startsWith('video/')
    const isImage = selectedFile.type.startsWith('image/')

    if (isVideo) {
      setFileType('video')
      const videoUrl = URL.createObjectURL(selectedFile)
      setPreview(videoUrl)
    } else if (isImage) {
      setFileType('image')
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  // ======================
  // CLEANUP
  // ======================
  const stopVideoAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
      analysisIntervalRef.current = null
    }
    setIsVideoAnalyzing(false)
  }, [])

  useEffect(() => {
    return () => {
      stopVideoAnalysis()
      if (preview && fileType === 'video') {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview, fileType, stopVideoAnalysis])

  // ======================
  // CAPTURE FRAME FROM VIDEO
  // ======================
  const captureFrameAsync = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) {
        resolve(null)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
    })
  }

  // ======================
  // BACKEND CALL FOR IMAGE
  // ======================
  const analyzeImage = async () => {
    if (!file) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('Backend error')
      }

      const data: BackendResponse = await res.json()

      // VALIDASI RESPONSE
      if (typeof data.class_id !== 'number' || !data.label) {
        throw new Error('Invalid backend response')
      }

      const isSafe = data.class_id === 0

      setResult({
        label: data.label,
        status: isSafe ? 'safe' : 'distracted',
        confidence: data.confidence
      })
    } catch (err) {
      console.error(err)
      alert('Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ======================
  // BACKEND CALL FOR VIDEO FRAME
  // ======================
  const analyzeFrame = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('file', blob, 'frame.jpg')

      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('Backend error')
      }

      const data: BackendResponse = await res.json()

      if (typeof data.class_id !== 'number' || !data.label) {
        throw new Error('Invalid backend response')
      }

      const isSafe = data.class_id === 0

      setResult({
        label: data.label,
        status: isSafe ? 'safe' : 'distracted',
        confidence: data.confidence
      })
    } catch (err) {
      console.error('Frame analysis error:', err)
    }
  }

  // ======================
  // VIDEO ANALYSIS CONTROL
  // ======================
  const startVideoAnalysis = () => {
    if (!videoRef.current) return
    
    videoRef.current.play()
    setIsVideoPlaying(true)
    setIsVideoAnalyzing(true)

    // Analyze every 500ms (2 frames per second) to prevent lag
    analysisIntervalRef.current = window.setInterval(async () => {
      const blob = await captureFrameAsync()
      if (blob) {
        analyzeFrame(blob)
      }
    }, 500)
  }

  const pauseVideoAnalysis = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsVideoPlaying(false)
    stopVideoAnalysis()
  }

  const toggleVideoAnalysis = () => {
    if (isVideoPlaying) {
      pauseVideoAnalysis()
    } else {
      startVideoAnalysis()
    }
  }

  const handleVideoEnded = () => {
    setIsVideoPlaying(false)
    stopVideoAnalysis()
  }

  const resetUpload = () => {
    stopVideoAnalysis()
    if (preview && fileType === 'video') {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setFileType(null)
    setPreview(null)
    setResult(null)
    setIsVideoPlaying(false)
  }

  // ======================
  // RENDER
  // ======================
  return (
    <section className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <h2 className="text-4xl font-bold text-center">
          Upload & Analyze
        </h2>

        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer p-16 border-2 border-dashed rounded-3xl border-slate-700 text-center"
          >
            <Upload className="w-16 h-16 mx-auto text-slate-400" />
            <p className="mt-4 text-lg">Click to upload image or video</p>
            <p className="mt-2 text-sm text-slate-500">Supports: JPG, PNG, MP4, WebM, etc.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={e => e.target.files && processFile(e.target.files[0])}
              hidden
            />
          </div>
        ) : (
          <>
            {/* PREVIEW */}
            <div className="rounded-xl overflow-hidden border border-slate-800 relative">
              {fileType === 'image' ? (
                <img
                  src={preview}
                  className="w-full max-h-[500px] object-contain"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={preview}
                    className="w-full max-h-[500px] object-contain"
                    onEnded={handleVideoEnded}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </div>

            {/* ANALYZE BUTTON FOR IMAGE */}
            {fileType === 'image' && !result && !isAnalyzing && (
              <button
                onClick={analyzeImage}
                className="w-full py-4 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700"
              >
                Analyze
              </button>
            )}

            {/* VIDEO CONTROLS */}
            {fileType === 'video' && (
              <button
                onClick={toggleVideoAnalysis}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  isVideoPlaying
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isVideoPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause Analysis
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {isVideoAnalyzing ? 'Resume Analysis' : 'Start Analysis'}
                  </>
                )}
              </button>
            )}

            {isAnalyzing && (
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-400" />
                <p className="mt-2 text-slate-400">Analyzing...</p>
              </div>
            )}

            {/* RESULT */}
            {result && (
              <div
                className={`p-6 rounded-xl border ${
                  result.status === 'safe'
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {result.status === 'safe'
                    ? <CheckCircle className="text-green-400" />
                    : <AlertCircle className="text-red-400" />
                  }
                  <h3 className="text-xl font-bold">
                    {result.status === 'safe' ? 'Safe' : 'Distracted'}
                  </h3>
                  {fileType === 'video' && isVideoAnalyzing && (
                    <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  )}
                </div>

                <p className="text-slate-300">
                  Class: <strong>{result.label}</strong>
                </p>

                <p className="text-slate-400">
                  Confidence:{' '}
                  {result.confidence !== null
                    ? `${(result.confidence * 100).toFixed(2)}%`
                    : '-'}
                </p>
              </div>
            )}

            <button
              onClick={resetUpload}
              className="w-full py-3 border border-slate-700 rounded-xl"
            >
              Upload New {fileType === 'video' ? 'Video' : 'Image'}
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default Detection
