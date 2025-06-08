import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, descriptor } = await req.json();
    
    if (!name || !descriptor) {
      return NextResponse.json({ error: 'Name and face descriptor are required' }, { status: 400 });
    }

    if (!Array.isArray(descriptor) || descriptor.length === 0) {
      return NextResponse.json({ error: 'Invalid face descriptor' }, { status: 400 });
    }

    await connectDB();

    // Check if user with same name already exists
    const existingUser = await User.findOne({ name: name.trim() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this name already exists' }, { status: 409 });
    }

    // Generate a unique email based on name and timestamp for internal use
    const timestamp = Date.now();
    const generatedEmail = `${name.toLowerCase().replace(/\s+/g, '.')}.${timestamp}@faceauth.local`;
    
    // Create a dummy password (won't be used for face authentication)
    const dummyPass = await bcrypt.hash(generatedEmail + timestamp, 10);

    // Create user with face descriptor
    const newUser = await User.create({ 
      name: name.trim(), 
      email: generatedEmail, 
      password: dummyPass, 
      faceDescriptor: descriptor,
      authMethod: 'face' // Track that this user uses face authentication
    });

    return NextResponse.json({ 
      message: 'Face signup successful',
      userId: newUser._id 
    }, { status: 201 });

  } catch (error) {
    console.error('Face signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during signup' 
    }, { status: 500 });
  }
}