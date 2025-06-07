"use client"
import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FaceSignupPage() {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef(null)
  
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState("Loading face models…")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)

  // ⬇️ load models once
  useEffect(() => {
    ;(async () => {
      try {
        const MODEL_URL = "/models"
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        setModelsLoaded(true)
        setStatus("Models loaded. Position your face in the camera.")
      } catch (err) {
        console.error("Model load error:", err)
        setStatus("Failed to load models.")
      }
    })()
  }, [])

  // ⬇️ improved capture with multiple detection attempts
  const handleCapture = async () => {
    if (!webcamRef.current || !modelsLoaded) {
      setStatus("Camera or models not ready.")
      return
    }

    setIsCapturing(true)
    setStatus("Capturing image...")

    try {
      // Wait a moment for the camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const screenshot = webcamRef.current.getScreenshot()
      if (!screenshot) {
        setStatus("Could not capture image. Try again.")
        setIsCapturing(false)
        return
      }

      setStatus("Analyzing face...")
      
      // Create image element from screenshot
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = screenshot
      })

      // Try multiple detection methods for better reliability
      let detection = null
      
      // First try with TinyFaceDetector (faster, good for clear faces)
      try {
        detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
          .withFaceLandmarks()
          .withFaceDescriptor()
      } catch (err) {
        console.log("TinyFaceDetector failed, trying SSD MobileNet...")
      }

      // If that fails, try SSD MobileNet (more robust)
      if (!detection) {
        try {
          detection = await faceapi
            .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
            .withFaceLandmarks()
            .withFaceDescriptor()
        } catch (err) {
          console.log("SSD MobileNet also failed:", err)
        }
      }

      if (!detection) {
        setStatus("No clear face detected. Please ensure your face is well-lit and centered, then try again.")
        setIsCapturing(false)
        return
      }

      // Validate face quality
      const box = detection.detection.box
      const minFaceSize = 100 // minimum face size in pixels
      
      if (box.width < minFaceSize || box.height < minFaceSize) {
        setStatus("Face too small. Please move closer to the camera.")
        setIsCapturing(false)
        return
      }

      setStatus("Face detected! Registering...")
      
      // Convert descriptor to array for JSON
      const descriptorArr = Array.from(detection.descriptor)

      const res = await fetch("/api/signup/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          descriptor: descriptorArr 
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setStatus("Signup successful! You may now log in.")
        setName("")
        setEmail("")
      } else {
        setStatus(data.error || "Signup failed. Please try again.")
      }
    } catch (error) {
      console.error("Capture error:", error)
      setStatus("Error during face capture. Please try again.")
    } finally {
      setIsCapturing(false)
    }
  }

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Face Recognition Signup</h1>
      
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        required
      />
      
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address"
        required
      />
      
      <div className="relative">
        {modelsLoaded ? (
          <div className="space-y-2">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full rounded-lg border"
              mirrored={true}
            />
            <div className="text-sm text-center text-gray-600">
              Position your face clearly in the frame
            </div>
          </div>
        ) : (
          <div className="w-full h-60 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Loading webcam…</span>
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleCapture} 
        disabled={!modelsLoaded || !name.trim() || !email.trim() || isCapturing}
        className="w-full"
      >
        {isCapturing ? "Processing..." : "Capture & Sign Up"}
      </Button>
      
      <div className="text-center text-sm font-medium">
        {status}
      </div>
    </div>
  )
}