import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { APIError } from '../types.js';

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

  if (error instanceof Error) {
    const apiError: APIError = {
      error: error.name,
      message: error.message
    };
    
    if (error.message.includes('not found')) {
      res.status(404).json(apiError);
      return;
    }
    
    if (error.message.includes('conflict') || error.message.includes('already')) {
      res.status(409).json(apiError);
      return;
    }
  }

  const apiError: APIError = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  };
  res.status(500).json(apiError);
};
