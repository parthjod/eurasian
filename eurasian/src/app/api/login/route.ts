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

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
