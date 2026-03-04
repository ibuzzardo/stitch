import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../src/middleware/logger.js';
import { errorHandler, HttpError } from '../src/middleware/error-handler.js';

describe('Middleware', () => {
  describe('logger', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let consoleSpy: any;

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        path: '/api/test'
      };
      
      mockRes = {
        on: vi.fn((event, callback) => {
          if (event === 'finish') {
            // Simulate response finishing after 100ms
            setTimeout(callback, 100);
          }
        })
      };
      
      mockNext = vi.fn();
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should call next function', () => {
      logger(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should register finish event listener', () => {
      logger(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log request details on finish', (done) => {
      mockRes.statusCode = 200;
      
      logger(mockReq as Request, mockRes as Response, mockNext);
      
      // Wait for the finish event to be triggered
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringMatching(/GET \/api\/test 200 \d+ms/)
        );
        done();
      }, 150);
    });
  });

  describe('errorHandler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let consoleSpy: any;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      mockNext = vi.fn();
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should handle ZodError with 400 status', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        }
      ]);

      errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: zodError.errors
      });
    });

    it('should handle "not found" errors with 404 status', () => {
      const notFoundError = new HttpError('Appointment not found', 404);

      errorHandler(notFoundError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error',
        message: 'Appointment not found'
      });
    });

    it('should handle "conflict" errors with 409 status', () => {
      const conflictError = new HttpError('This time slot is already booked', 409);

      errorHandler(conflictError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error',
        message: 'This time slot is already booked'
      });
    });

    it('should handle "already" errors with 409 status', () => {
      const alreadyError = new HttpError('Appointment already exists', 409);

      errorHandler(alreadyError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error',
        message: 'Appointment already exists'
      });
    });

    it('should handle generic Error with 500 status', () => {
      const genericError = new Error('Something went wrong');

      errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error',
        message: 'Something went wrong'
      });
    });

    it('should handle unknown errors with 500 status', () => {
      const unknownError = 'string error';

      errorHandler(unknownError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    });

    it('should log all errors', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith('Error:', error);
    });
  });
});