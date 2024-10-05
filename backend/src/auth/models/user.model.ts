import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number: string;
  status: 'ACTIVE' | 'INACTIVE';
  address: string;
  otp:  mongoose.Types.ObjectId;
  image: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>({
  first_name: {
    type: String,
    required: true,
  },
  
  last_name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password_hash: {
    type: String,
    required: true,
  },

  phone_number: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },

  otp: {
    type: Schema.Types.ObjectId,
    ref: 'OTP',
    required: true,
  },

  status: {
    type: String,
    enum: [ 'ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    required: true,
  },

  address: {
    type: String,
    required: false,
  },

  image: {
    type: String,
    required: false,
  },

  created_at: {
     type: Date,
     required: false,
     default: Date.now(),
  },

  updated_at: {
     type: Date,
     required: false,
     default: Date.now(),
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const User = mongoose.model<IUser>('User', userSchema);
