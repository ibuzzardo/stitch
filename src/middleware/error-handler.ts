import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { APIError } from '../types.js';

export class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    const apiError: APIError = {
      error: 'Validation Error',
      message: 'Invalid input data',
      details: error.errors
    };
    res.status(400).json(apiError);
    return;
  }

  if (error instanceof HttpError) {
    const apiError: APIError = {
      error: error.name,
      message: error.message
    };
    res.status(error.statusCode).json(apiError);
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    const apiError: APIError = {
      error: 'Bad Request',
      message: 'Invalid JSON in request body'
    };
    res.status(400).json(apiError);
    return;
  }

  if (error instanceof Error) {
    const apiError: APIError = {
      error: error.name,
      message: error.message
    };
    res.status(500).json(apiError);
    return;
  }

  const apiError: APIError = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  };
  res.status(500).json(apiError);
};
