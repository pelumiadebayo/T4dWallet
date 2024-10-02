import { Request, Response } from 'express';
import { AuthService } from "../services/user.service";


export class AuthController {
    // constructor(private readonly authService: AuthService) {}

    static async forgotPassword (req: Request, res:Response): Promise<void> {
        const { email } = req.body;
        try {
            await AuthService.forgotPassword(email);
            
            // const liveEnvs = ["production", "staging"];
            // const currentEnv = process.env.NODE_ENV;

            // let otpSent: boolean;
            // if (liveEnvs.includes(currentEnv)) {
            //     // send token to patient via SMS        
            // } else {
            //     otpSent = true;
            // }

            res.status(200).json({message: "Password reset OTP token sent successfully"});
        } catch (err) {
            res.status(500).json({message: "Error sending OTP token"});
        }       
    }

    static async resetPassword (req: Request, res: Response) {
        const { userId, token, password } = req.body;
        try {
            await AuthService.resetPassword(userId, token, password);
            res.status(200).json({message: "Password reset successfully"});
        } catch (err) {
            res.status(500).json({message: "Error resetting password"});
        }
    }
}