import mongoose from "mongoose";
import { createOTP, findByEmail } from "../../queries/signup.queries";
import { generateOTP, hashPassword, isValidPassword } from "../../../utils/helper.functions";
import { IOtp, OTP } from "../../models/otp.model";
import { sendEMail } from "../../../utils/emails/send-email";
import { User } from "../../models/user.model";
import {
  TForgotPasswordPayload,
  TForgotPasswordResponse,
  TResetPasswordPayload,
} from "./types/passwords.types";
import { IMailData } from "../../../utils/emails/types";
import { appEmitter } from "../../../globals/events";
import { LOG_EVENTS } from "../../../logs/events/log.event";

const MAX_FAILED_ATTEMPTS = 5;

export const forgotPasswordService = async (
  payload: TForgotPasswordPayload
): Promise<TForgotPasswordResponse> => {
  const userExist = await findByEmail(payload);

  try {

    if (!userExist) throw new Error("User not found");

    const { otp, expiresAt } = generateOTP();

        // hash otp
        const hashedCode = await hashPassword(otp);

    const otpPayload: Partial<IOtp> = {
      code: hashedCode,
      expires_at: expiresAt,
    };

    const otpId = await createOTP(otpPayload);

    userExist.otp = otpId._id as mongoose.Types.ObjectId;

    await userExist.save();

    const mailData: IMailData = {
      templateKey: "forgotPasswordEmail",
      email: payload.email,
      placeholders: { OTP: otp, firstname: userExist.first_name },
      subject: "Password Reset Request",
    };

    await sendEMail(mailData);
    
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "FORGOT_PASSWORD",
      user_id: userExist.id,
      details: `Forgot password`,
  })

    return {
      otp: otp,
      email: payload.email,
    };
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "FORGOT_PASSWORD",
      user_id: userExist.id,
      details: `Forgot password`,
      error_message: error.message
  })
    console.log("Error sending OTP: ", error);
    throw new Error(error.message || "Error sending OTP");
  }
};

export const resetPasswordService = async (payload: TResetPasswordPayload) => {
  const userExist = await findByEmail({email: payload.email});

  try {

    if (!userExist) throw new Error("User not found");

    const otpRecord = await OTP.findOne({
      _id: userExist.otp,
      expires_at: { $gt: new Date() },
    });

    
      if (!otpRecord) {
        await OTP.findOneAndUpdate(
          { _id: userExist.otp },
          { $inc: { failed_attempts: 1 } }
        );
        throw new Error("OTP has expired");
      }

    if (!(await isValidPassword(payload.otp, otpRecord.code))) {
      throw new Error("Invalid OTP");
    }
    // const MAX_FAILED_ATTEMPTS = parseInt(process.env.FAILED_ATTEMPTS);
    if (otpRecord.failed_attempts >= MAX_FAILED_ATTEMPTS) {
      throw new Error("Maximum failed attempts reached");
    }

    const hashedPassword = await hashPassword(payload.newPassword);
    const updatedUser = await User.findOneAndUpdate(
      { email: payload.email },
      {
        password_hash: hashedPassword,
        otp: null
      },
      { new: true }
    );
    
    if (!updatedUser) {
      await OTP.findByIdAndUpdate(otpRecord._id, {
        $inc: { failed_attempts: 1 },
      });
      throw new Error("User not found");
    }
    const check = await OTP.findByIdAndUpdate(otpRecord._id, {
      used: true,
      failed_attempts: 0,
    });

    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "success",
      action: "RESET_PASSWORD",
      user_id: userExist.id,
      details: `Reset password`,
  })

    return true;
  } catch (error: any) {
    appEmitter.emit(LOG_EVENTS.LOG_ACTION, {
      status: "failed",
      action: "RESET_PASSWORD",
      user_id: userExist.id,
      details: `Reset password`,
      error_message: error.message || "Could not reset password"
  })
    console.error("Error during password reset: ", error);
    throw new Error(error.message || "Error resetting password");
  }
};
