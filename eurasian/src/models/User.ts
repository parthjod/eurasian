import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  password?: string;
  faceDescriptor?: number[];
  faceRegistered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // Optional for face-only authentication
  },
  faceDescriptor: {
    type: [Number],
    default: null,
    // Array of 128 floating-point numbers from face-api.js
  },
  faceRegistered: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster face lookups
UserSchema.index({ faceRegistered: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);