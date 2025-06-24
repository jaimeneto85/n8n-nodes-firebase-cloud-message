import { 
  validateToken, 
  validateTopic, 
  validateCondition, 
  validateMessagePayload,
  validateJsonFormat 
} from '../utils/validation.utils';

import { 
  handleFirebaseError, 
  createErrorResponse 
} from '../utils/error.utils';

describe('Integration Tests', () => {
  describe('Validation and Error Handling Integration', () => {
    it('should validate token and handle error appropriately', () => {
      // Invalid token
      const invalidToken = 'invalid-token';
      
      // Validation should fail
      expect(validateToken(invalidToken)).toBe(false);
      
      // Create an error object similar to what Firebase would return
      const error = {
        code: 'messaging/invalid-registration-token',
        message: 'The registration token is not a valid FCM registration token'
      };
      
      // Handle the error
      const handledError = handleFirebaseError(error);
      expect(handledError).toBeInstanceOf(Error);
      expect(handledError.message).toContain('The registration token is invalid or not registered with FCM');
      
      // Create standardized error response
      const errorResponse = createErrorResponse(error);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toContain('The registration token is invalid or not registered with FCM');
      expect(errorResponse.errorCode).toBe('messaging/invalid-registration-token');
      expect(errorResponse.timestamp).toBeDefined();
    });
    
    it('should validate topic and handle error appropriately', () => {
      // Invalid topic
      const invalidTopic = 'invalid topic with spaces';
      
      // Validation should fail
      expect(validateTopic(invalidTopic)).toBe(false);
      
      // Create an error object similar to what Firebase would return
      const error = {
        code: 'messaging/topic-name-invalid',
        message: 'Topic name is invalid'
      };
      
      // Handle the error
      const handledError = handleFirebaseError(error);
      expect(handledError).toBeInstanceOf(Error);
      expect(handledError.message).toContain('The topic name is invalid');
      
      // Create standardized error response
      const errorResponse = createErrorResponse(error);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toContain('The topic name is invalid');
      expect(errorResponse.errorCode).toBe('messaging/topic-name-invalid');
    });
    
    it('should validate condition and handle error appropriately', () => {
      // Invalid condition
      const invalidCondition = 'invalid condition format';
      
      // Validation should fail
      expect(validateCondition(invalidCondition)).toBe(false);
      
      // Create an error object similar to what Firebase would return
      const error = {
        code: 'messaging/invalid-argument',
        message: 'Invalid condition format'
      };
      
      // Handle the error
      const handledError = handleFirebaseError(error);
      expect(handledError).toBeInstanceOf(Error);
      expect(handledError.message).toContain('Invalid argument provided to Firebase messaging service');
      
      // Create standardized error response
      const errorResponse = createErrorResponse(error);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toContain('Invalid argument provided to Firebase messaging service');
      expect(errorResponse.errorCode).toBe('messaging/invalid-argument');
    });
    
    it('should validate JSON format and handle error appropriately', () => {
      // Invalid JSON
      const invalidJson = '{"key": value}'; // Missing quotes around value
      
      // Validation should fail
      expect(validateJsonFormat(invalidJson)).toBe(false);
      
      // Create an error object
      const error = new Error('Unexpected token v in JSON at position 8');
      
      // Handle the error
      const handledError = handleFirebaseError(error);
      expect(handledError).toBeInstanceOf(Error);
      expect(handledError.message).toContain('Error: Unexpected token v in JSON at position 8');
      
      // Create standardized error response
      const errorResponse = createErrorResponse(error);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toContain('Unexpected token v in JSON at position 8');
    });
    
    it('should validate message payload and handle error appropriately', () => {
      // Invalid message payload
      const invalidPayload = {
        someField: 'value' // Missing notification or data
      };
      
      // Validation should fail
      expect(validateMessagePayload(invalidPayload)).toBe(false);
      
      // Create an error object
      const error = {
        code: 'messaging/invalid-payload',
        message: 'Invalid message payload'
      };
      
      // Handle the error
      const handledError = handleFirebaseError(error);
      expect(handledError).toBeInstanceOf(Error);
      expect(handledError.message).toContain('Firebase error: Invalid message payload');
      
      // Create standardized error response
      const errorResponse = createErrorResponse(error);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toContain('Firebase error: Invalid message payload');
      expect(errorResponse.errorCode).toBe('messaging/invalid-payload');
    });
  });
}); 