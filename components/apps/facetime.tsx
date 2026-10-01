"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Download, Trash2, VideoOff } from "lucide-react"

interface FaceTimeProps {
  isDarkMode?: boolean
}

type CameraState = "starting" | "ready" | "unavailable"

export default function FaceTime({ isDarkMode = true }: FaceTimeProps) {
  const [cameraState, setCameraState] = useState<CameraState>("starting")
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [flash, setFlash] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white"
  const textColor = isDarkMode ? "text-white" : "text-gray-800"

  // Start the camera when the app opens and always release it when the window closes
  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable")
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        // The window may have been closed while the permission prompt was showing
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }
        stream = mediaStream
        if (videoRef.current) videoRef.current.srcObject = mediaStream
        setCameraState("ready")
      })
      .catch((err) => {
        console.error("Error accessing camera:", err)
        if (!cancelled) setCameraState("unavailable")
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mirror the photo so it matches the selfie preview
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    setCapturedPhotos((prev) => [canvas.toDataURL("image/png"), ...prev])
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
  }

  const deletePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={`h-full flex flex-col ${bgColor} ${textColor}`}>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative">
        <div className="relative w-full max-w-2xl aspect-video rounded-xl bg-black overflow-hidden">
          {/* The video element is always mounted so the stream can be attached as soon as it's ready */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover -scale-x-100 ${cameraState === "ready" ? "" : "invisible"}`}
          />

          {cameraState !== "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              {cameraState === "starting" ? (
                <>
                  <div className="w-8 h-8 border-2 border-white/70 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-white/80">Starting camera… allow access when your browser asks.</p>
                </>
              ) : (
                <>
                  <VideoOff className="w-10 h-10 mb-3 text-white/70" />
                  <p>Camera access is not available.</p>
                  <p className="text-sm text-white/60 mt-1">Check your browser permissions and reopen FaceTime.</p>
                </>
              )}
            </div>
          )}

          {flash && <div className="absolute inset-0 bg-white/80" />}
        </div>

        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden" />

        {cameraState === "ready" && (
          <button
            className="mt-4 w-14 h-14 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-lg ring-4 ring-white/30 active:scale-95 transition-transform"
            onClick={capturePhoto}
            aria-label="Take photo"
          >
            <Camera className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Captured photos gallery */}
      {capturedPhotos.length > 0 && (
        <div className={`p-4 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
          <h3 className="text-sm font-medium mb-2">Captured Photos</h3>
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {capturedPhotos.map((photo, index) => (
              <div key={photo.slice(-32) + index} className="relative group shrink-0">
                <img src={photo} alt={`Captured photo ${index + 1}`} className="h-24 w-auto rounded" />
                <div className="absolute top-1 right-1 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <a
                    href={photo}
                    download={`facetime-photo-${index + 1}.png`}
                    className="bg-blue-500 text-white rounded-full p-1"
                    aria-label="Download photo"
                  >
                    <Download className="w-3 h-3" />
                  </a>
                  <button
                    className="bg-red-500 text-white rounded-full p-1"
                    onClick={() => deletePhoto(index)}
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
