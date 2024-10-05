import { createOTP, createUser, findByEmail } from "../../database/queries/signup.queries";
import { ISignupPayload } from "../interfaces/signup.interface";
import { generateOTP, hashPassword } from "../../utils/helper.functions";
import { IOtp } from "../models/otp.model";
import mongoose from "mongoose";
import { sendSignUpMail } from "../../utils/send-email";
import { ISignupMail } from "../../utils/types";
import { IUser } from "../models/user.model";

export const signupService = async (payload: ISignupPayload): Promise<IUser> => {
     try {
          const userExist = await findByEmail(payload);

          if (userExist) throw new Error("User with details already exist...Login");

          const { otp, expiresAt } = generateOTP();

          const otpPayload: Partial<IOtp> = {
               code: otp,
               expires_at: expiresAt,

          }
          const otpId = await createOTP(otpPayload);

          const hashedPassword = await hashPassword(payload.password);

          const createPayload = {
               ...payload,
               password: hashedPassword,
               otp: otpId._id as mongoose.Types.ObjectId,
          }

          const newUser = await createUser(createPayload)

          const mailData: ISignupMail = {
               email: payload.email,
               otp: otp,
               firstName: payload.firstName,
          }

          await sendSignUpMail(mailData);

          return newUser;
     } catch (error: any) {
          console.log('Could not create user: ', error);
          throw new Error(error.message || 'Could not create user')
          
     }
}