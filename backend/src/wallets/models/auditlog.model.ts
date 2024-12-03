import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
    action: string; // "DEACTIVATE", "SUSPEND", "DELETE", "REACTIVATE"
    wallet: mongoose.Types.ObjectId;
    performedBy: mongoose.Types.ObjectId; 
    reason: string;
    created_at: Date;
    updated_at: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        action: {
            type: String,
            required: true,
        },

        wallet: {
            type: Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
        },

        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reason: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
