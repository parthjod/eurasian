import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;          // bcrypt hash
  faceDescriptor?: number[]; // 128-d array for face-api.js
  authMethod?: 'password' | 'face' | 'both';
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name cannot be empty'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  faceDescriptor: { 
    type: [Number], 
    default: [],
    validate: {
      validator: function(v: number[]) {
        // If faceDescriptor is provided, it must be exactly 128 numbers
        return v.length === 0 || v.length === 128;
      },
      message: 'Face descriptor must be exactly 128 numbers or empty'
    }
  },
  authMethod: {
    type: String,
    enum: ['password', 'face', 'both'],
    default: 'password'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users' // Explicitly set collection name
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

// Pre-save middleware to set authMethod based on available auth data
UserSchema.pre('save', function(next) {
  if (this.isModified('faceDescriptor') || this.isModified('password')) {
    const hasFace = this.faceDescriptor && this.faceDescriptor.length === 128;
    const hasPassword = this.password && this.password.length > 0;
    
    if (hasFace && hasPassword) {
      this.authMethod = 'both';
    } else if (hasFace) {
      this.authMethod = 'face';
    } else {
      this.authMethod = 'password';
    }
  }
  next();
});

// Instance method to check if user has face authentication
UserSchema.methods.hasFaceAuth = function(): boolean {
  return this.faceDescriptor && this.faceDescriptor.length === 128;
};

// Instance method to get safe user data (without sensitive info)
UserSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    authMethod: this.authMethod,
    hasFaceAuth: this.hasFaceAuth(),
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find user by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Ensure the model is only compiled once
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);