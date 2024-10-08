import { IOtp, OTP } from "../../auth/models/otp.model";
import { ICreateUserData } from "../../auth/interfaces/signup.interface";
import { IUser, User } from "../../auth/models/user.model"

export const findByEmail = async ({ email }: { email: string }): Promise<IUser> => {
     try {
          return User.findOne({ email }).exec();

     } catch (e: any) {
          console.log(`Could not get user by email: ${e.message}`);

          throw new Error('could not ge user by email');
     }
}

export const createUser = async (data: ICreateUserData): Promise<IUser> => {
     const user = new User({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password_hash: data.password,
          otp: data.otp
     })
     
     return await user.save()
 };

export const createOTP = async (data: Partial<IOtp>): Promise<IOtp> => {
     const otp = new OTP({
          code: data.code,
          expires_at: data.expires_at,
          failed_attempts: data.failed_attempts,
     })
     
     return await otp.save();
 };
 