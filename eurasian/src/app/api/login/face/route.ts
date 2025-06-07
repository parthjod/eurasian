import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import distance from "euclidean-distance"
import { signJwt } from "@/lib/jwt"

const THRESHOLD = 0.6 // smaller = more strict

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { descriptor } = body

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: "Invalid or missing face descriptor" },
        { status: 400 }
      )
    }

    await connectDB()

    const users = await User.find({ faceDescriptor: { $exists: true, $not: { $size: 0 } } })

    let bestMatch = null
    let minDistance = Infinity

    for (const user of users) {
      const userDescriptor = user.faceDescriptor
      if (!Array.isArray(userDescriptor) || userDescriptor.length !== 128) continue

      const dist = distance(descriptor, userDescriptor)
      if (dist < minDistance) {
        minDistance = dist
        bestMatch = user
      }
    }

    if (bestMatch && minDistance < THRESHOLD) {
      const token = signJwt({ sub: bestMatch._id.toString() })
      return NextResponse.json({ message: "Login successful", token })
    }

    return NextResponse.json({ error: "Face not recognized" }, { status: 401 })
  } catch (err) {
    console.error("Face login error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
