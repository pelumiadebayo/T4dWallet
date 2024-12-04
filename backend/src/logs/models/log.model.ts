import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILogs extends Document {
    action: string; // "DEACTIVATE", "SUSPEND", "DELETE", "REACTIVATE"
    performedBy: mongoose.Types.ObjectId; 
    description: string;
    name: string;
    status: 'success' | 'failed';
    error_message: string
    created_at: Date;
    updated_at: Date;
}

const LogsSchema = new Schema<ILogs>(
    {
        action: {
            type: String,
            required: true,
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        name: {
            description: {
                type: String,
                required: false,
            },
        },
        description: {
            type: String,
            required: true,
        },

        error_message: {
            type: String,
            required: false,
            default: ''
        },

        status: {
            type: String,
            enum: ["success", "failed"],
            default: 'success',
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

export const Logs = mongoose.model<ILogs>("Logs", LogsSchema);
