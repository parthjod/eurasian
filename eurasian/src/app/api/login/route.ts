import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Interface for login request body
interface LoginBody {
  email: string;
  password: string;
}

// Interface for JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to generate JWT token
function generateJWT(userId: string, email: string): string {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    } as JWTPayload,
    JWT_SECRET
  )
}

export async function POST(req: NextRequest) {
  try {
    const body: LoginBody = await req.json()
    const { email, password } = body

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password must be strings' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: trimmedEmail })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, // Don't reveal which one is wrong
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { 
      lastLogin: new Date() 
    })

    // Generate JWT token
    const token = generateJWT(user._id.toString(), user.email)

    // Return success response with token and user info
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        authMethod: user.authMethod,
        hasFaceAuth: user.faceDescriptor && user.faceDescriptor.length > 0
      }
    }, { status: 200 })

  } catch (err) {
    console.error("Login error:", err)
    
    // Handle specific errors
    if (err && typeof err === 'object' && 'name' in err) {
      const errorName = (err as { name: string }).name
      
      if (errorName === 'MongooseError' || errorName === 'MongoError') {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 503 }
        )
      }

      if (errorName === 'JsonWebTokenError') {
        return NextResponse.json(
          { error: 'Authentication error. Please try again.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}