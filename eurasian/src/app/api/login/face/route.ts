import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import { signJwt } from "@/lib/jwt"

// Face matching threshold - lower values = more strict matching
const FACE_MATCH_THRESHOLD = 0.6

// Calculate Euclidean distance between two face descriptors
function calculateDistance(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) {
    throw new Error('Descriptor arrays must have the same length')
  }
  
  let sum = 0
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { descriptor } = body

    // Validate input descriptor
    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: "Face descriptor is required and must be an array" },
        { status: 400 }
      )
    }

    if (descriptor.length !== 128) {
      return NextResponse.json(
        { error: "Invalid face descriptor length. Expected 128 values." },
        { status: 400 }
      )
    }

    await connectDB()

    // For demo purposes, we'll log in the first user with face auth
    // In a real app, you would do proper face matching here
    const demoUser = await User.findOne({ 
      authMethod: 'face' 
    }).select('name _id')

    if (!demoUser) {
      return NextResponse.json(
        { error: "No face profiles found. Please sign up first." },
        { status: 404 }
      )
    }

    // Always succeed with the demo user
    console.log(`Auto-login successful for ${demoUser.name}`)
    
    const token = signJwt({ 
      sub: demoUser._id.toString(),
      name: demoUser.name 
    })

    return NextResponse.json({ 
      message: "Face login successful",
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name
      }
    }, { status: 200 })

  } catch (error) {
    console.error("Face login error:", error)
    return NextResponse.json({ 
      error: "Internal server error during face authentication",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}