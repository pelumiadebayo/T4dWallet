import mongoose from "mongoose";

export interface ISignupPayload {
     firstName: string,
     lastName: string;
     email: string;
     password: string;
}

export interface ICreateUserData extends ISignupPayload {
     otp: mongoose.Types.ObjectId;
};

export interface ICreateOTP {
     code: string;
     expires_at: string;
     failed_attempts?: number;
     // user: mongoose.Types.ObjectId;
     created_at: Date;
     updated_at: Date;
}