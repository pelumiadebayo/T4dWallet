import { Router } from "express";
import { AuthController } from "../controllers/user.controller";



const router = Router();

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;