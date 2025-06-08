"use client"

import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function FaceLoginPage() {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState("Loading face recognition models...")
  const [isCapturing, setIsCapturing] = useState(false)


  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"
        
        setStatus("Loading face recognition models...")
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        
        setModelsLoaded(true)
        setStatus("Ready! Position your face in the camera and click login.")
      } catch (err) {
        console.error("Model loading error:", err)
        setStatus("Failed to load face recognition models. Please refresh the page.")
      }
    }

    loadModels()
  }, [])

  // Enhanced face capture and login
  const handleCapture = async () => {
    if (!webcamRef.current || !modelsLoaded) {
      setStatus("Camera or models not ready. Please wait.")
      return
    }

    setIsCapturing(true)
    setStatus("Capturing and analyzing your face...")

    try {
      // Allow camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const screenshot = webcamRef.current.getScreenshot()
      if (!screenshot) {
        throw new Error("Could not capture image from camera")
      }

      setStatus("Processing face data...")
      
      // Create and load image
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Failed to load captured image"))
        img.src = screenshot
      })

      // Attempt face detection with multiple methods
      let detection = null
      
      // Try TinyFaceDetector first (faster)
      try {
        detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416, 
            scoreThreshold: 0.3 
          }))
          .withFaceLandmarks()
          .withFaceDescriptor()
      } catch (err) {
        console.log("TinyFaceDetector failed, trying SSD MobileNet...")
      }

      // Fallback to SSD MobileNet
      if (!detection) {
        try {
          detection = await faceapi
            .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ 
              minConfidence: 0.3 
            }))
            .withFaceLandmarks()
            .withFaceDescriptor()
        } catch (err) {
          console.log("SSD MobileNet detection failed:", err)
        }
      }

      // Try detecting all faces and pick the largest
      if (!detection) {
        try {
          const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.2
            }))
            .withFaceLandmarks()
            .withFaceDescriptors()

          if (detections.length > 0) {
            detection = detections.reduce((largest, current) => 
              current.detection.box.area > largest.detection.box.area ? current : largest
            )
            console.log(`Found ${detections.length} faces, using the largest one`)
          }
        } catch (err) {
          console.log("Multiple face detection failed:", err)
        }
      }

      if (!detection) {
        throw new Error("No face detected. Please ensure your face is well-lit, centered, and clearly visible.")
      }

      // Validate face quality
      const box = detection.detection.box
      const minFaceSize = 80
      
      if (box.width < minFaceSize || box.height < minFaceSize) {
        throw new Error("Face appears too small. Please move closer to the camera.")
      }

      // Check if face descriptor was generated properly
      if (!detection.descriptor || detection.descriptor.length === 0) {
        throw new Error("Could not generate face signature. Please try again.")
      }

      setStatus("Face captured! Verifying identity...")
      
      // Convert descriptor to array for API
      const descriptorArray = Array.from(detection.descriptor)

      // Submit to backend for matching
      const response = await fetch("/api/login/face", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          descriptor: descriptorArray 
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Store authentication token
        localStorage.setItem("token", data.token)
        
        setStatus(`Welcome back, ${data.user.name}! Login successful.`)
        
        // Redirect after short delay
        setTimeout(() => {
          router.push("/dashboard") // or wherever you want to redirect
        }, 1500)
        
      } else {
        // Handle different error scenarios
        if (response.status === 401) {
          const errorMsg = data.details?.message || "Face not recognized"
          setStatus(`Authentication failed: ${errorMsg}`)
        } else if (response.status === 404) {
          setStatus("No face profiles found. Please sign up first.")
        } else {
          setStatus(data.error || "Login failed. Please try again.")
        }
      }

    } catch (error) {
      console.error("Face login error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setStatus(`Error: ${errorMessage}`)
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
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Face Recognition Login</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Look at the camera to authenticate with your face
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {modelsLoaded ? (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full rounded-lg border-2 border-gray-200"
                  mirrored={true}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                
                {/* Face detection guide */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-dashed border-blue-400 rounded-lg opacity-30"></div>
                </div>
                
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                  Position your face in the guide box
                </div>
              </div>
            ) : (
              <div className="w-full h-60 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <span className="text-gray-500">Loading camera...</span>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleCapture} 
            disabled={!modelsLoaded || isCapturing}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </>
            ) : (
              "Capture & Login"
            )}
          </Button>
          
          <div className="text-center">
            <div className={`text-sm font-medium p-3 rounded-lg ${
              status.includes('successful') || status.includes('Welcome') ? 'bg-green-50 text-green-700' :
              status.includes('Error') || status.includes('failed') ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {status}
            </div>
          </div>
          
          {/* Enhanced tips */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-2">💡 Tips for successful login:</p>
            <ul className="space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Position your face in the center guide</li>
              <li>• Look directly at the camera</li>
              <li>• Remove glasses or hats if login fails</li>
              <li>• Stay still during capture</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}