import { Request, Response } from "express";
import { errorHandler, successHandler } from "../../utils/helper.functions";
import { TForgotPasswordPayload } from "../services/passwords/types/passwords.types";
import { forgotPasswordService } from "../services/passwords/passwords.service";

export const forgotPasswordController = async(req: Request, res: Response) => {
     try {
          const data: TForgotPasswordPayload = req.body;          

          const result = await forgotPasswordService(data);

          return successHandler(res, 'OTP sent to your email', result);

     } catch (error: any) {
          console.log('Error sending OTP: ', error);
          return errorHandler(res, error.message || 'Error sending OTP');    
     };
}