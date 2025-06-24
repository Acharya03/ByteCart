export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly details?: any;

	constructor(message: string, statusCode: number, isOperational = true, details?: any) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.details = details;
		Error.captureStackTrace(this);
	}
}

// not found error
export class NotfoundError extends AppError {
	constructor(message: "Resources not found") {
		super(message, 404);
	}
}

// validation error (use for joi/zod/react-hook-form validation errors)
export class ValidationError extends AppError {
	constructor(message = "Invalid request data", details?: any) {
		super(message, 400, true, details);
	}
}

//jwt authentication error
export class AuthError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401);
	}
}

//forbidden error
export class ForbiddenError extends AppError {
	constructor(message = "Forbidden") {
		super(message, 403);
	}
}

//database error (for MongoDB/postgres errors)
export class DatabaseError extends AppError {
	constructor(message = "Database error", details?:any) {
		super(message, 500, true, details);
	}
}

//Rate limit error (if user exceeds api limit)
export class RateLimitError extends AppError {
	constructor(message = "too many requets, please try again later") {
		super(message, 429);
	}
}
