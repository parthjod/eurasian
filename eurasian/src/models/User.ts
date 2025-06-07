import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;          // bcrypt hash
  faceDescriptor?: number[]; // 128-d array
}

const UserSchema = new Schema<IUser>({
  name: String,
  email: { type: String, unique: true },
  password: String,
  faceDescriptor: { type: [Number], default: [] }
});

export default mongoose.models.User ??
  mongoose.model<IUser>('User', UserSchema);
