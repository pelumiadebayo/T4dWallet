import { Request, Response } from "express";
import { errorHandler, successHandler } from "../../utils/helper.functions";
import { TResetPasswordPayload } from "../services/passwords/types/passwords.types";
import { resetPasswordService } from "../services/passwords/passwords.service";

export const resetPasswordController = async(req: Request, res: Response) => {
     try {
          const data: TResetPasswordPayload = req.body;          

          const result = await resetPasswordService(data);

          return successHandler(res, 'Password reset successfully', result);

     } catch (error: any) {
          console.log('Error resetting password, please try again: ', error);
          return errorHandler(res, error.message || 'Error resetting your password, please try again.');    
     };
}