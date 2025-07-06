import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';
import { sendEmail } from './sendMail';
import { NextFunction } from 'express';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
	data: any, 
	userType: "user" | "seller"
) => {
	const { name, email, password, phone_number, country } = data;

	if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
		throw new ValidationError(`Missing required fields!`);
	}

	if (!emailRegex.test(email)) {
		throw new ValidationError("Invalid email format!");
	}
};

export const checkOtpRestrictions = async (
	email: string, 
	next: NextFunction
) => {
	if (await redis.get(`otp_lock:${email}`)) {
		return next(new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes"));
	}

	if (await redis.get(`otp_spam_lock:${email}`)) {
		return next(
			new ValidationError("Too many OTP requests! Please wait 1 hour before requesting again.")
		);
	}

	if(await redis.get(`otp_cooldown:${email}`)){
		return next(
			new ValidationError("Please wait 1 minute before requesting a new OTP.")
		);
	}
};


export const trackOtpRequests = async (
	email: string, 
	next: NextFunction
) => {
	const otpRequestKey = `otp_request_count:${email}`;

	let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

	if(otpRequests >= 2){
		await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // Lock for 1 hour
		return next(
			new ValidationError("Too manu OTP requests! Please wait 1 hour before requesting again.")
		);
	}

	await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); // Increment request count and set expiration to 1 hour
}
export const sendOtp = async (
	name: string, 
	email: string, 
	template: string
) => {
	const otp = crypto.randomInt(1000, 9999).toString(); // Generate a 4-digit OTP

	await sendEmail(email, "Verify your email", template, { name, otp });

	await redis.set(`otp:${email}`, otp, "EX", 300); // 5 minutes expiration

	await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);  // 1 minute cooldown
};

export const verifyOtp = async (
	email: string,
	otp: string,
	next: NextFunction
) => {
	const storedOtp = await redis.get(`otp:${email}`);
	if(!storedOtp) {
		return next(
			new ValidationError(
				"OTP expired or not found! Please request a new one."
			)
		);
	}

	const failedAttemptsKey = `otp_attempts:${email}`;
	const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

	if(storedOtp !== otp) {
		if(failedAttempts >= 2){
			await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock for 30 minutes
			await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP and attempts
			return next(
				new ValidationError(
					"Account locked due to multiple failed attempts! Try again after 30 minutes"
				)
			);
		}
		await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300); 
		return next(
			new ValidationError(
				`Incorrect OTP! ${2 - failedAttempts} attempts remaining.`
			)
		);
	}

	await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP and attempts
}