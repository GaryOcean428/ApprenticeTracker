import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateError, RateErrorCode } from '../errors';

describe('RateError', () => {
  it('should create an error with default code', () => {
    const error = new RateError('Something went wrong');
    
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe(RateErrorCode.UNKNOWN);
    expect(error.name).toBe('RateError');
    expect(error.httpStatus).toBe(500);
    expect(error.context).toEqual({});
    expect(error.timestamp).toBeDefined();
  });
  
  it('should create an error with specified code and cause', () => {
    const cause = new Error('Original error');
    const error = new RateError('Failed operation', { 
      code: RateErrorCode.NOT_FOUND,
      cause
    });
    
    expect(error.message).toBe('Failed operation');
    expect(error.code).toBe(RateErrorCode.NOT_FOUND);
    expect(error.cause).toBe(cause);
    expect(error.httpStatus).toBe(404);
  });
  
  it('should create an error with context', () => {
    const context = { id: '123', operation: 'update' };
    const error = new RateError('Context error', { context });
    
    expect(error.context).toEqual(context);
  });
  
  it('should override default httpStatus when provided', () => {
    const error = new RateError('Custom status', { 
      code: RateErrorCode.NOT_FOUND,
      httpStatus: 400
    });
    
    expect(error.httpStatus).toBe(400); // Overridden from default 404
  });
  
  it('should convert to JSON format', () => {
    const cause = new Error('Original error');
    cause.stack = 'Error: Original error\n  at test';
    
    const error = new RateError('Test error', {
      code: RateErrorCode.VALIDATION_FAILED,
      cause,
      context: { test: true }
    });
    
    const json = error.toJSON();
    
    expect(json.name).toBe('RateError');
    expect(json.message).toBe('Test error');
    expect(json.code).toBe(RateErrorCode.VALIDATION_FAILED);
    expect(json.context).toEqual({ test: true });
    expect(json.cause).toEqual({
      name: 'Error',
      message: 'Original error',
      stack: 'Error: Original error\n  at test'
    });
  });
  
  it('should create a notFound error', () => {
    const error = RateError.notFound('Template not found', { id: '123' });
    
    expect(error).toBeInstanceOf(RateError);
    expect(error.code).toBe(RateErrorCode.NOT_FOUND);
    expect(error.message).toBe('Template not found');
    expect(error.context).toEqual({ id: '123' });
    expect(error.httpStatus).toBe(404);
  });
  
  it('should create a validationFailed error', () => {
    const error = RateError.validationFailed('Invalid data');
    
    expect(error).toBeInstanceOf(RateError);
    expect(error.code).toBe(RateErrorCode.VALIDATION_FAILED);
    expect(error.message).toBe('Invalid data');
    expect(error.httpStatus).toBe(400);
  });
  
  it('should create a permissionDenied error', () => {
    const error = RateError.permissionDenied('No access', { userId: 'user1' });
    
    expect(error).toBeInstanceOf(RateError);
    expect(error.code).toBe(RateErrorCode.PERMISSION_DENIED);
    expect(error.message).toBe('No access');
    expect(error.context).toEqual({ userId: 'user1' });
    expect(error.httpStatus).toBe(403);
  });
  
  it('should create an alreadyExists error', () => {
    const error = RateError.alreadyExists('Duplicate template');
    
    expect(error).toBeInstanceOf(RateError);
    expect(error.code).toBe(RateErrorCode.ALREADY_EXISTS);
    expect(error.message).toBe('Duplicate template');
    expect(error.httpStatus).toBe(409);
  });
  
  it('should create a databaseError', () => {
    const cause = new Error('DB Connection failed');
    const error = RateError.databaseError('Failed to query database', cause);
    
    expect(error).toBeInstanceOf(RateError);
    expect(error.code).toBe(RateErrorCode.DATABASE_ERROR);
    expect(error.message).toBe('Failed to query database');
    expect(error.cause).toBe(cause);
    expect(error.httpStatus).toBe(500);
  });
});
