import mongoose, { Schema, Document } from "mongoose";

export enum Role {
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  password_hash: string;
  phone_number: string;
  status: "ACTIVE" | "INACTIVE";
  address: string;
  otp: mongoose.Types.ObjectId;
  image: string;
  created_at: Date;
  updated_at: Date;
  isVerified: Boolean;
}

const userSchema = new Schema<IUser>(
  {
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
      ref: "OTP",
      required: false,
      default: null,
      sparse: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.USER
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
    },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password_hash;
  delete user.otp;
  return user;
};

export const User = mongoose.model<IUser>("User", userSchema);
