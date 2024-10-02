import { User } from "../models/user.model";
import { OTP } from "../models/otp.model";
import bcrypt from 'bcrypt';



export class AuthService {
    static async forgotPassword(email: string) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const otp = new OTP({
            user: user._id,
            token: "",
            expires_at: new Date()
        });

        otp.generateOtpToken();
        // send otp to user email here...
        return otp.save();
    }

    static async resetPassword(userId: string, otpToken: string, newPassword: string) {
        const otpRecord = await OTP.findOne({ user: userId, token: otpToken });

        if (!otpRecord) {
            throw new Error("Invalid OTP");
        }

        // Check if OTP has expired
        if (new Date() > otpRecord.expires_at) {
            throw new Error('OTP has expired');
        }

        const user = await User.findById({userId});
        if (!user) {
            throw new Error("User not found");
        }

        const password = await bcrypt.hash(newPassword, 10);
        user.password_hash = password;
        return user.save();
    }
}
