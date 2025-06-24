/**
 * Validation utilities for Firebase Cloud Messaging node
 */

/**
 * Validates an FCM token format
 * @param token The FCM token to validate
 * @returns True if the token is valid, false otherwise
 */
export function validateToken(token: string): boolean {
  // FCM tokens are typically ~150+ characters and contain a colon
  return Boolean(token && token.length > 100 && token.includes(':'));
}

/**
 * Validates a topic name format
 * @param topic The topic name to validate
 * @returns True if the topic name is valid, false otherwise
 */
export function validateTopic(topic: string): boolean {
  // Topics must match pattern [a-zA-Z0-9-_.~%]+
  return Boolean(topic && /^[a-zA-Z0-9-_.~%]+$/.test(topic));
}

/**
 * Validates a condition expression
 * @param condition The condition expression to validate
 * @returns True if the condition is valid, false otherwise
 */
export function validateCondition(condition: string): boolean {
  // Basic validation - should contain 'in topics' and be properly formatted with logical operators
  return Boolean(condition && 
    condition.includes('in topics') && 
    (condition.includes('&&') || condition.includes('||')));
}

/**
 * Validates a message payload structure
 * @param payload The message payload to validate
 * @returns True if the payload structure is valid, false otherwise
 */
export function validateMessagePayload(payload: any): boolean {
  // Check required fields and structure
  return Boolean(payload && 
    (payload.notification || payload.data) && 
    (!payload.notification || typeof payload.notification === 'object') &&
    (!payload.data || typeof payload.data === 'object'));
}

/**
 * Validates Android notification options
 * @param androidConfig Android-specific options
 * @returns True if the options are valid, false otherwise
 */
export function validateAndroidConfig(androidConfig: any): boolean {
  if (!androidConfig || typeof androidConfig !== 'object') return false;
  
  // Check priority is valid if present
  if (androidConfig.priority && 
      !['high', 'normal'].includes(androidConfig.priority)) {
    return false;
  }
  
  // Check ttl is valid if present
  if (androidConfig.ttl && 
      (typeof androidConfig.ttl !== 'string' || !/^\d+[smh]$/.test(androidConfig.ttl))) {
    return false;
  }
  
  // Check notification is valid if present
  if (androidConfig.notification && typeof androidConfig.notification !== 'object') {
    return false;
  }
  
  return true;
}

/**
 * Validates iOS (APNS) notification options
 * @param apnsConfig APNS-specific options
 * @returns True if the options are valid, false otherwise
 */
export function validateApnsConfig(apnsConfig: any): boolean {
  if (!apnsConfig || typeof apnsConfig !== 'object') return false;
  
  // Check headers are valid if present
  if (apnsConfig.headers && typeof apnsConfig.headers !== 'object') {
    return false;
  }
  
  // Check payload is valid if present
  if (apnsConfig.payload && typeof apnsConfig.payload !== 'object') {
    return false;
  }
  
  return true;
}

/**
 * Validates JSON string format
 * @param jsonString The JSON string to validate
 * @returns True if the string is valid JSON, false otherwise
 */
export function validateJsonFormat(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' && parsed !== null;
  } catch (error) {
    return false;
  }
} 