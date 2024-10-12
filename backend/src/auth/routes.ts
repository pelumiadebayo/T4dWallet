import { Router } from "express";
import { signupController } from "./controllers/signup.controller";
import { validateBody } from "../midllewares/validate";
import { SignupDTO } from "./dtos/signup.dto";
import { ResetPasswordDTO } from "./dtos/resetpassword.dto";
import { ForgotPasswordDTO } from "./dtos/forgotpassword.dto";
import { forgotPasswordController } from "./controllers/forgot-password.conttoller";
import { resetPasswordController } from "./controllers/reset-password.controller";


const router = Router();

router.post('/signup', validateBody(SignupDTO), signupController);
router.post('/forgot-password', validateBody(ForgotPasswordDTO), forgotPasswordController);
router.post('/reset-password', validateBody(ResetPasswordDTO), resetPasswordController)

export default router;