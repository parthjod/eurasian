import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

// Helper function to calculate Euclidean distance between face descriptors
function calculateDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) return Infinity
  
  let sum = 0
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2)
  }
  return Math.sqrt(sum)
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate face descriptor
function isValidDescriptor(descriptor: any): boolean {
  return (
    Array.isArray(descriptor) &&
    descriptor.length === 128 &&
    descriptor.every(val => typeof val === 'number' && !isNaN(val))
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, descriptor } = body

    // Enhanced validation
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      )
    }

    if (!isValidDescriptor(descriptor)) {
      return NextResponse.json(
        { error: "Invalid face descriptor. Must be an array of 128 numbers" },
        { status: 400 }
      )
    }

    await connectDB()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    // Check duplicate email
    const existingUser = await User.findOne({ email: trimmedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Check for duplicate faces to prevent same person registering multiple times
    const existingFaces = await User.find({ 
      faceDescriptor: { $exists: true, $ne: [] } 
    }).select('faceDescriptor email name')

    const FACE_SIMILARITY_THRESHOLD = 0.6 // Lower = more similar required
    
    for (const user of existingFaces) {
      if (user.faceDescriptor && Array.isArray(user.faceDescriptor)) {
        const distance = calculateDistance(descriptor, user.faceDescriptor)
        
        if (distance < FACE_SIMILARITY_THRESHOLD) {
          return NextResponse.json(
            { 
              error: "A very similar face is already registered. If this is you, please use the existing account.",
              existingEmail: user.email.substring(0, 3) + "***@" + user.email.split('@')[1] // Partially mask email
            },
            { status: 409 }
          )
        }
      }
    }

    // Generate a more secure dummy password
    const dummyPassword = await bcrypt.hash(
      `face_auth_${trimmedEmail}_${Date.now()}_${Math.random()}`,
      12
    )

    // Create new user
    const newUser = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: dummyPassword,
      faceDescriptor: descriptor,
      authMethod: 'face', // Track authentication method
      createdAt: new Date(),
    })

    // Log successful registration (remove in production or use proper logging)
    console.log(`New face registration: ${trimmedName} (${trimmedEmail})`)

    return NextResponse.json(
      { 
        message: "Face signup successful",
        userId: newUser._id // Useful for frontend tracking
      },
      { status: 201 }
    )

  } catch (err) {
    console.error("Face signup error:", err)
    
    // Handle specific MongoDB errors
    if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 11000) { // Duplicate key error
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      )
    }

    if (typeof err === 'object' && err !== null && 'name' in err && (err as any).name === 'ValidationError') {
      return NextResponse.json(
        { error: "Invalid user data provided" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}