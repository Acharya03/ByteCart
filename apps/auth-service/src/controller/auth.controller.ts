import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";


// Register a new user
export const userRegistration = async (
	req: Request, 
	res: Response, 
	next: NextFunction
) => {


	try {
		validateRegistrationData(req.body, "user");
		const { name, email } = req.body;

		const existingUser = await prisma.users.findUnique({
			where: { email } 
		});

		if (existingUser) {
			return next(new ValidationError("User already exists with this email!"));
		};

		await checkOtpRestrictions(email, next);

		await trackOtpRequests(email, next);

		await sendOtp(name, email, "user-activation-mail");

		res.status(200).json({
			message: "OTP sent to your mail. Please verify your account.",
		});
	} catch (error) {
		return next(error);
	}

}

//Verify user with OTP
export const verifyUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { name, otp, email, password } = req.body;
		if(email || !otp || !email || !password) {
			return next(new ValidationError("All fields are required!"));
		}
		const existingUser = await prisma.users.findUnique({
			where: { email }
		});

		if(existingUser) {
			return next(new ValidationError("User already exists with this email!"));
		}

		await verifyOtp(email, otp, next);
	} catch (error) {
		
	}
}