/**
 * Validation utilities for Firebase Cloud Messaging node
 */
/**
 * Validates an FCM token format
 * @param token The FCM token to validate
 * @returns True if the token is valid, false otherwise
 */
export declare function validateToken(token: string): boolean;
/**
 * Validates a topic name format
 * @param topic The topic name to validate
 * @returns True if the topic name is valid, false otherwise
 */
export declare function validateTopic(topic: string): boolean;
/**
 * Validates a condition expression
 * @param condition The condition expression to validate
 * @returns True if the condition is valid, false otherwise
 */
export declare function validateCondition(condition: string): boolean;
/**
 * Validates a message payload structure
 * @param payload The message payload to validate
 * @returns True if the payload structure is valid, false otherwise
 */
export declare function validateMessagePayload(payload: any): boolean;
/**
 * Validates Android notification options
 * @param androidConfig Android-specific options
 * @returns True if the options are valid, false otherwise
 */
export declare function validateAndroidConfig(androidConfig: any): boolean;
/**
 * Validates iOS (APNS) notification options
 * @param apnsConfig APNS-specific options
 * @returns True if the options are valid, false otherwise
 */
export declare function validateApnsConfig(apnsConfig: any): boolean;
/**
 * Validates JSON string format
 * @param jsonString The JSON string to validate
 * @returns True if the string is valid JSON, false otherwise
 */
export declare function validateJsonFormat(jsonString: string): boolean;
