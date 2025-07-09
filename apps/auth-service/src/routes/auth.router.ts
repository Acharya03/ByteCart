import express, { Router } from 'express';
import { loginUser, userRegistration, verifyUser } from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/register', userRegistration);
router.post('/verify-user', verifyUser);
router.post("/login", loginUser);

export default router;