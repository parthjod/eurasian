"use client"
import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FaceSignupPage() {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState("Loading face recognition models…")
  const [name, setName] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"
        
        setStatus("Loading face detection models...")
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        
        setModelsLoaded(true)
        setStatus("Ready! Position your face clearly in the camera and click capture.")
      } catch (err) {
        console.error("Model loading error:", err)
        setStatus("Failed to load face recognition models. Please refresh the page.")
      }
    }

    loadModels()
  }, [])

  // Enhanced face capture with better error handling
  const handleCapture = async () => {
    if (!webcamRef.current || !modelsLoaded) {
      setStatus("Camera or models not ready. Please wait.")
      return
    }

    if (!name.trim()) {
      setStatus("Please enter your name before capturing.")
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

      // Attempt face detection with multiple methods for reliability
      let detection = null
      
      // Try TinyFaceDetector first (faster)
      try {
        detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416, 
            scoreThreshold: 0.25 
          }))
          .withFaceLandmarks()
          .withFaceDescriptor()
      } catch (err) {
        console.log("TinyFaceDetector attempt failed, trying alternative...")
      }

      // Fallback to SSD MobileNet if needed
      if (!detection) {
        try {
          detection = await faceapi
            .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ 
              minConfidence: 0.25 
            }))
            .withFaceLandmarks()
            .withFaceDescriptor()
        } catch (err) {
          console.log("SSD MobileNet detection failed:", err)
        }
      }

      if (!detection) {
        throw new Error("No face detected. Please ensure your face is well-lit, centered, and clearly visible.")
      }

      // Validate face detection quality
      const box = detection.detection.box
      const minFaceSize = 80
      
      if (box.width < minFaceSize || box.height < minFaceSize) {
        throw new Error("Face appears too small. Please move closer to the camera.")
      }

      // Check if face descriptor was generated properly
      if (!detection.descriptor || detection.descriptor.length === 0) {
        throw new Error("Could not generate face signature. Please try again.")
      }

      setStatus("Face captured successfully! Registering account...")
      
      // Convert descriptor to array for storage
      const descriptorArray = Array.from(detection.descriptor)

      // Submit to backend
      const response = await fetch("/api/signup/face", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          descriptor: descriptorArray 
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus("Account created successfully! You can now use face login.")
        setSignupComplete(true)
        // Clear form
        setName("")
      } else {
        throw new Error(data.error || "Registration failed")
      }

    } catch (error) {
      console.error("Face capture error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setStatus(`Error: ${errorMessage}`)
    } finally {
      setIsCapturing(false)
    }
  }

  const resetForm = () => {
    setSignupComplete(false)
    setStatus("Ready! Position your face clearly in the camera and click capture.")
    setName("")
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
          <CardTitle className="text-center">Face Recognition Signup</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Create an account using your face as authentication
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!signupComplete ? (
            <>
              <div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isCapturing}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be your display name for the account
                </p>
              </div>
              
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
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                      Look directly at the camera with good lighting
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
                disabled={!modelsLoaded || !name.trim() || isCapturing}
                className="w-full"
                size="lg"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Capture Face & Create Account"
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-lg font-semibold">✓ Account Created!</div>
              <p className="text-sm text-gray-600">
                Your face has been registered successfully. You can now log in using face recognition.
              </p>
              <Button onClick={resetForm} variant="outline" className="w-full">
                Create Another Account
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <div className={`text-sm font-medium p-3 rounded-lg ${
              status.includes('Error') ? 'bg-red-50 text-red-700' :
              status.includes('successful') ? 'bg-green-50 text-green-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {status}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}