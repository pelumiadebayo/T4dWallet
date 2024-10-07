import { Request, Response } from "express";
import { errorHandler, successHandler } from "../../utils/helper.functions";
import { SignupDTO } from "../dtos/signup.dto";
import { signupService } from "../services/signup.service";

export const signupController = async(req: Request, res: Response) => {
     try {
          const data: SignupDTO = req.body;          

          const newUser = await signupService(data);

          const createdUser = {
               firstName: newUser.first_name,
               lastName: newUser.last_name,
               email: newUser.email,
               status: newUser.status,
          }

          return successHandler(res, 'Signup successful', createdUser)

     } catch (error: any) {
          console.log('Could not complete signup: ', error);
          return errorHandler(res, error.message || 'Could not complete signup')
          
     }
}