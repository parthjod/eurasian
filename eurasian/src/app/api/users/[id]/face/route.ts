import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { FaceRecognitionUtils } from '@/lib/face-utils';

// Update user's face data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { faceDescriptor } = await request.json();

    // Validate face descriptor
    if (!FaceRecognitionUtils.isValidDescriptor(faceDescriptor)) {
      return NextResponse.json(
        { error: 'Invalid face descriptor' },
        { status: 400 }
      );
    }

    // Update user's face data
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        faceDescriptor,
        faceRegistered: true,
      },
      { new: true, select: '-faceDescriptor' }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Face data updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        faceRegistered: user.faceRegistered,
      },
    });

  } catch (error) {
    console.error('Face update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user's face data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findByIdAndUpdate(
      params.id,
      {
        $unset: { faceDescriptor: 1 },
        faceRegistered: false,
      },
      { new: true, select: '-faceDescriptor' }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Face data removed successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        faceRegistered: user.faceRegistered,
      },
    });

  } catch (error) {
    console.error('Face delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}