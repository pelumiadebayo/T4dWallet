import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IOtp extends Document {
  token: string;
  expires_at: Date;
  failed_attempts?: number;
  user: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;

  generateOtpToken(): string;
}

const otpSchema = new Schema<IOtp>({
  token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
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

// Generate OTP token
otpSchema.methods.generateOtpToken = function () {
  const token = process.env.NODE_ENV.startsWith("prod")
  ? crypto.randomBytes(6).toString("hex")
  : crypto.randomBytes(3).toString("hex");

  // Set the expiration time to 6 minutes
  const expirationTime = new Date(Date.now() + 6 * 60 * 1000);

  this.token = crypto.createHash("sha256").update(token).digest("hex");
  this.expires_at = expirationTime;

  return token;
}
