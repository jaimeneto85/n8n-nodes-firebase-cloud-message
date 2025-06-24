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
export function handleFirebaseError(error: any): Error {
  // Common Firebase error codes and their user-friendly messages
  const errorMap: Record<string, string> = {
    // Messaging errors
    'messaging/registration-token-not-registered': 'The provided registration token is not registered or has expired.',
    'messaging/invalid-argument': 'Invalid argument provided to Firebase messaging service.',
    'messaging/invalid-recipient': 'The recipient of the message is invalid.',
    'messaging/payload-size-limit-exceeded': 'The message payload exceeds the size limit (4KB for data messages).',
    'messaging/invalid-registration-token': 'The registration token is invalid or not registered with FCM.',
    'messaging/invalid-package-name': 'The package name is invalid.',
    'messaging/too-many-topics': 'The maximum number of topics the device can be subscribed to has been exceeded.',
    'messaging/authentication-error': 'An authentication error occurred. Please check your credentials.',
    'messaging/server-unavailable': 'The FCM server is unavailable. Please try again later.',
    'messaging/topic-name-invalid': 'The topic name is invalid. It should match the pattern: [a-zA-Z0-9-_.~%]+',
    
    // App initialization errors
    'app/invalid-credential': 'The Firebase credential is invalid. Please check your service account configuration.',
    'app/invalid-app-options': 'The Firebase app options are invalid.',
    'app/app-deleted': 'The Firebase app has been deleted.',
    'app/duplicate-app': 'A Firebase app with the same name already exists.',
    
    // Auth errors
    'auth/invalid-credential': 'The credential used to authenticate is invalid.',
    'auth/invalid-service-account': 'The service account credentials are invalid.',
    'auth/insufficient-permission': 'The credential used does not have sufficient permissions.',
    'auth/project-not-found': 'The Firebase project was not found.',
    
    // Network errors
    'ECONNREFUSED': 'Network error: Unable to connect to Firebase servers. Please check your internet connection.',
    'ETIMEDOUT': 'Network error: Connection to Firebase servers timed out. Please check your internet connection.',
    'ENOTFOUND': 'Network error: Firebase server hostname not found. Please check your internet connection and DNS settings.',
  };
  
  // Extract error code and message
  const errorCode = error.code || (typeof error === 'string' ? error : 'UNKNOWN_ERROR');
  const errorMessage = error.message || (typeof error === 'string' ? error : 'Unknown error occurred');
  
  // Return mapped error message if available, otherwise use the original message
  if (errorMap[errorCode]) {
    return new Error(`${errorMap[errorCode]} (${errorCode})`);
  }
  
  // Handle other Firebase errors that might not have specific mappings
  if (errorCode.startsWith('messaging/') || 
      errorCode.startsWith('app/') || 
      errorCode.startsWith('auth/')) {
    return new Error(`Firebase error: ${errorMessage} (${errorCode})`);
  }
  
  // Default error handling for unknown errors
  return new Error(`Error: ${errorMessage}`);
}

/**
 * Creates a standardized error response object
 * @param error The error object
 * @returns A standardized error response object
 */
export function createErrorResponse(error: any): IErrorResponse {
  return {
    success: false,
    error: error.message || 'Unknown error occurred',
    errorCode: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
} 