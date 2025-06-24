/**
 * Error handling utilities for Firebase Cloud Messaging node
 */
/**
 * Interface for error response structure
 */
export interface IErrorResponse {
    success: boolean;
    error: string;
    errorCode?: string;
    timestamp: string;
}
/**
 * Maps Firebase error codes to user-friendly messages
 * @param error The error object from Firebase
 * @returns A new Error with a user-friendly message
 */
export declare function handleFirebaseError(error: any): Error;
/**
 * Creates a standardized error response object
 * @param error The error object
 * @returns A standardized error response object
 */
export declare function createErrorResponse(error: any): IErrorResponse;
