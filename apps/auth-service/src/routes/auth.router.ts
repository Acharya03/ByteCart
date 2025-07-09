import express, { Router } from 'express';
import { loginUser, resetUserPassword, userForgotPassword, userRegistration, verifyUser, verifyUserForgotPassword } from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/register', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login', loginUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);


export default router;