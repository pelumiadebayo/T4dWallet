import mongoose from "mongoose";
import { createOTP, findByEmail } from "../../../database/queries/signup.queries";
import { generateOTP, hashPassword } from "../../../utils/helper.functions";
import { IOtp, OTP } from "../../models/otp.model";
import { sendForgotPasswordMail } from "../../../utils/send-email";
import { IForgotPasswordMail } from "../../../utils/types";
import { User } from "../../models/user.model";
import { TForgotPasswordPayload, TResetPasswordPayload } from "./types/passwords.types";

export const forgotPasswordService = async (payload: TForgotPasswordPayload) => {
     try {
          const userExist = await findByEmail(payload);

          if (!userExist) throw new Error("User not found");

          const { otp, expiresAt } = generateOTP();

          const otpPayload: Partial<IOtp> = {
               code: otp,
               expires_at: expiresAt,
          };

          const otpId = await createOTP(otpPayload);
          userExist.otp = otpId._id as mongoose.Types.ObjectId;
          await userExist.save();

          const mailData: IForgotPasswordMail = {
               email: payload.email,    
               otp: otp,
               expiresAt: expiresAt
          };

          await sendForgotPasswordMail(mailData);

          return {
               message: "OTP sent successfully",
               status: true,
          };
     } catch (error: any) {
          console.log('Error sending OTP: ', error);
          throw new Error(error.message || 'Error sending OTP');          
     };
}

export const resetPasswordService = async (payload: TResetPasswordPayload) => {
     try {
          const otpRecord = await OTP.findOne({
               code: payload.otp,
               expires_at: { $gt: new Date() }
          });
          if (!otpRecord) {
               await OTP.findOneAndUpdate(
                    { code: payload.otp },
                    { $inc: { failed_attempts: 1 } }
               );
               throw new Error("Invalid OTP or OTP has expired");
          }
          const MAX_FAILED_ATTEMPTS = parseInt(process.env.FAILED_ATTEMPTS)
          if (otpRecord.failed_attempts >= MAX_FAILED_ATTEMPTS) {
               throw new Error("Maximum failed attempts reached");
          }

          const hashedPassword = await hashPassword(payload.newPassword)
          const updatedUser = await User.findOneAndUpdate(
               { otp: otpRecord._id },
               { 
                   password: hashedPassword,
                   $unset: { otp: 1 }  // Remove the OTP field from the user document
               },
               { new: true }
          );
          if (!updatedUser) {
               await OTP.findByIdAndUpdate(otpRecord._id, { $inc: { failed_attempts: 1}});
               throw new Error("User not found");
          }
          await OTP.findByIdAndUpdate(otpRecord._id, {
               used:  true,
               failed_attempts: 0

          });
          
          return { 
               success: true, 
               message: "Password reset successfully" 
          };
     } catch (error: any) {
          console.error("Error during password reset: ", error);
        throw new Error(error.message || "Error resetting password");
     }
}
