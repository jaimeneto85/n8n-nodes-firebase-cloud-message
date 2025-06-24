"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_utils_1 = require("../utils/error.utils");
describe('Error Utilities', () => {
    describe('handleFirebaseError', () => {
        it('should handle messaging errors with mapped messages', () => {
            const error = {
                code: 'messaging/registration-token-not-registered',
                message: 'Original error message'
            };
            const result = (0, error_utils_1.handleFirebaseError)(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain('The provided registration token is not registered or has expired');
            expect(result.message).toContain('(messaging/registration-token-not-registered)');
        });
        it('should handle app initialization errors with mapped messages', () => {
            const error = {
                code: 'app/invalid-credential',
                message: 'Original error message'
            };
            const result = (0, error_utils_1.handleFirebaseError)(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain('The Firebase credential is invalid');
            expect(result.message).toContain('(app/invalid-credential)');
        });
        it('should handle network errors with mapped messages', () => {
            const error = {
                code: 'ECONNREFUSED',
                message: 'Original error message'
            };
            const result = (0, error_utils_1.handleFirebaseError)(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain('Network error: Unable to connect to Firebase servers');
            expect(result.message).toContain('(ECONNREFUSED)');
        });
        it('should handle unmapped Firebase errors with a generic message', () => {
            const error = {
                code: 'messaging/unknown-error',
                message: 'Some unknown messaging error'
            };
            const result = (0, error_utils_1.handleFirebaseError)(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain('Firebase error');
            expect(result.message).toContain('Some unknown messaging error');
            expect(result.message).toContain('(messaging/unknown-error)');
        });
        it('should handle non-Firebase errors', () => {
            const error = {
                message: 'Generic error without code'
            };
            const result = (0, error_utils_1.handleFirebaseError)(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain('Error: Generic error without code');
        });
        it('should handle string errors', () => {
            const error = 'String error message';
            const result = (0, error_utils_1.handleFirebaseError)(error);
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toContain('Error: String error message');
        });
        it('should handle null or undefined errors', () => {
            const result1 = (0, error_utils_1.handleFirebaseError)(null);
            expect(result1).toBeInstanceOf(Error);
            expect(result1.message).toContain('Error: Unknown error occurred');
            const result2 = (0, error_utils_1.handleFirebaseError)(undefined);
            expect(result2).toBeInstanceOf(Error);
            expect(result2.message).toContain('Error: Unknown error occurred');
        });
    });
    describe('createErrorResponse', () => {
        it('should create a standardized error response object with all fields', () => {
            const error = {
                code: 'TEST_ERROR',
                message: 'Test error message'
            };
            const response = (0, error_utils_1.createErrorResponse)(error);
            expect(response).toHaveProperty('success', false);
            expect(response).toHaveProperty('error', 'Test error message');
            expect(response).toHaveProperty('errorCode', 'TEST_ERROR');
            expect(response).toHaveProperty('timestamp');
            expect(new Date(response.timestamp).getTime()).not.toBeNaN();
        });
        it('should handle errors without code', () => {
            const error = {
                message: 'Error without code'
            };
            const response = (0, error_utils_1.createErrorResponse)(error);
            expect(response).toHaveProperty('success', false);
            expect(response).toHaveProperty('error', 'Error without code');
            expect(response).toHaveProperty('errorCode', 'UNKNOWN_ERROR');
        });
        it('should handle errors without message', () => {
            const error = {
                code: 'ERROR_CODE'
            };
            const response = (0, error_utils_1.createErrorResponse)(error);
            expect(response).toHaveProperty('success', false);
            expect(response).toHaveProperty('error', 'Unknown error occurred');
            expect(response).toHaveProperty('errorCode', 'ERROR_CODE');
        });
        it('should handle null or undefined errors', () => {
            const response1 = (0, error_utils_1.createErrorResponse)(null);
            expect(response1).toHaveProperty('success', false);
            expect(response1).toHaveProperty('error', 'Unknown error occurred');
            expect(response1).toHaveProperty('errorCode', 'UNKNOWN_ERROR');
            const response2 = (0, error_utils_1.createErrorResponse)(undefined);
            expect(response2).toHaveProperty('success', false);
            expect(response2).toHaveProperty('error', 'Unknown error occurred');
            expect(response2).toHaveProperty('errorCode', 'UNKNOWN_ERROR');
        });
    });
});
//# sourceMappingURL=error.utils.test.js.map