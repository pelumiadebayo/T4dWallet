import mongoose from "mongoose";

export interface ILogActionPayload {
     status: 'success' | 'failed',
     action: string,
     name?: string,
     user_id?: string,
     details?: string,
     error_message?: string,
     transaction?: mongoose.ClientSession
}