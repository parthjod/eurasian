import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error('MONGODB_URI not set in .env.local');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(uri);
  isConnected = true;
}

// Avoid model overwrite issues in dev
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });

    return NextResponse.json({ message: 'Signup successful' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
