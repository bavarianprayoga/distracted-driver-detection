import React, { useState, useRef } from 'react'
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle
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

const Detection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ======================
  // FILE HANDLING
  // ======================
  const processFile = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)

    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(selectedFile)
  }

  // ======================
  // BACKEND CALL
  // ======================
  const analyzeFile = async () => {
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

  const resetUpload = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
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
            <p className="mt-4 text-lg">Click to upload image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => e.target.files && processFile(e.target.files[0])}
              hidden
            />
          </div>
        ) : (
          <>
            {/* PREVIEW */}
            <div className="rounded-xl overflow-hidden border border-slate-800">
              <img
                src={preview}
                className="w-full max-h-[500px] object-contain"
              />
            </div>

            {/* ANALYZE */}
            {!result && !isAnalyzing && (
              <button
                onClick={analyzeFile}
                className="w-full py-4 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700"
              >
                Analyze
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
              Upload New Image
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default Detection
