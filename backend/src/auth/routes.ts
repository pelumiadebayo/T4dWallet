import { Router } from "express";
import { signupController } from "./controllers/signup.controller";
import { validateBody } from "../midllewares/validate";
import { SignupDTO } from "./dtos/signup.dto";

const router = Router();

router.post('/signup', validateBody(SignupDTO), signupController);

export default router;