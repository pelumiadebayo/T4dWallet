import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  code: string;
  expires_at: string;
  failed_attempts?: number;
  user: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const otpSchema = new Schema<IOtp>({
  code: {
    type: String,
    required: true,
  },
  expires_at: {
    type: String,
    required: true,
  },
  failed_attempts: {
    type: Number,
    default: 0,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const OTP = mongoose.model<IOtp>('Otp', otpSchema);
