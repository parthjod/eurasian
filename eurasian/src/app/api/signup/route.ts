import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 6 // Minimum 6 characters
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

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

    if (!password || typeof password !== 'string' || !isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password is required and must be at least 6 characters long" },
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const newUser = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      authMethod: 'password', // Track authentication method
      createdAt: new Date(),
    })

    // Log successful registration (remove in production or use proper logging)
    console.log(`New user registration: ${trimmedName} (${trimmedEmail})`)

    return NextResponse.json(
      { 
        message: "User signup successful",
        userId: newUser._id,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      },
      { status: 201 }
    )

  } catch (err) {
    console.error("User signup error:", err)
    
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