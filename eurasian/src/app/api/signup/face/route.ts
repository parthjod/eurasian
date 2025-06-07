import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const { name, email, descriptor } = await req.json();
  if (!name || !email || !descriptor) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await connectDB();

  if (await User.findOne({ email })) {
    return NextResponse.json({ error: 'Email already used' }, { status: 409 });
  }

  const dummyPass = await bcrypt.hash(email + Date.now(), 10);   // placeholder
  await User.create({ name, email, password: dummyPass, faceDescriptor: descriptor });

  return NextResponse.json({ message: 'Face signup successful' }, { status: 201 });
}
