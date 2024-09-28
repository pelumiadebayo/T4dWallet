import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  wallet_id: string;
  balance: string;
  wallet_pin: string;
  status: "ACTIVE" | "INACTIVE";
  user: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    wallet_id: {
      type: String,
      required: true,
      unique: true,
    },

    balance: {
      type: String,
      required: true,
    },

    wallet_pin: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
