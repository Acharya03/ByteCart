import express, { Router } from 'express';
import { userRegistration } from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/register', userRegistration);


export default router;