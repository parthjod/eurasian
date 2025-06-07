"use client"

import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function FaceLoginPage() {
  const webcamRef = useRef<Webcam>(null)
  const router = useRouter()

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState("Loading face-api models...")

  // Load face-api models once
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
        setStatus("Models loaded. Position your face clearly in the camera.")
      } catch (err) {
        console.error("Model load error:", err)
        setStatus("Failed to load face models.")
      }
    })()
  }, [])

  // Improved capture function with better face detection
  const handleCapture = async () => {
    if (!webcamRef.current) {
      setStatus("Camera not ready.")
      return
    }

    const shot = webcamRef.current.getScreenshot()
    if (!shot) {
      setStatus("Could not capture image.")
      return
    }

    setStatus("Detecting face...")
    
    try {
      // Create image element for face-api
      const img = new Image()
      img.src = shot
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      console.log("Image loaded, size:", img.width, "x", img.height)

      // Try multiple detection methods
      let detection = null

      // Method 1: Try TinyFaceDetector (faster, good for real-time)
      detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      // Method 2: If TinyFaceDetector fails, try SSD MobileNet (more accurate)
      if (!detection) {
        console.log("TinyFaceDetector failed, trying SSD MobileNet...")
        detection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.5
          }))
          .withFaceLandmarks()
          .withFaceDescriptor()
      }

      // Method 3: Try detecting all faces and pick the largest
      if (!detection) {
        console.log("Single face detection failed, trying multiple face detection...")
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.3
          }))
          .withFaceLandmarks()
          .withFaceDescriptors()

        if (detections.length > 0) {
          // Pick the largest face (most likely the main subject)
          detection = detections.reduce((largest, current) => 
            current.detection.box.area > largest.detection.box.area ? current : largest
          )
          console.log(`Found ${detections.length} faces, using largest one`)
        }
      }

      if (!detection) {
        setStatus("No face detected. Please ensure your face is clearly visible, well-lit, and centered.")
        return
      }

      console.log("Face detected successfully")
      setStatus("Face detected! Verifying...")

      const descriptorArr = Array.from(detection.descriptor)

      const res = await fetch("/api/login/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: descriptorArr }),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        setStatus("Login successful! Redirecting...")
        router.push("/")
      } else {
        setStatus(data.error || "Face not recognised.")
      }
    } catch (error) {
      console.error("Face detection error:", error)
      setStatus("Error during face detection. Please try again.")
    }
  }

  return (
    <div className="space-y-4 max-w-sm mx-auto py-12">
      {modelsLoaded ? (
        <div className="relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            className="w-full rounded border"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />
          {/* Face detection guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-dashed border-blue-400 rounded-lg opacity-50"></div>
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center border rounded">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading webcam…</p>
          </div>
        </div>
      )}

      <Button
        onClick={handleCapture}
        disabled={!modelsLoaded}
        className="w-full"
      >
        Capture & Login
      </Button>

      <p className="text-center text-sm text-muted-foreground">{status}</p>
      
      {/* Tips for better face detection */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Tips for better detection:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Ensure good lighting on your face</li>
          <li>Position your face in the center guide</li>
          <li>Look directly at the camera</li>
          <li>Remove glasses or hats if detection fails</li>
        </ul>
      </div>
    </div>
  )
}