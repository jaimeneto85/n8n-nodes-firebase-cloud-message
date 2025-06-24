import {
  validateToken,
  validateTopic,
  validateCondition,
  validateMessagePayload,
  validateAndroidConfig,
  validateApnsConfig,
  validateJsonFormat
} from '../utils/validation.utils';

describe('Validation Utilities', () => {
  describe('validateToken', () => {
    it('should return true for valid FCM tokens', () => {
      const validToken = 'fMEQJLC7PUI:APA91bHxN8GlSUqGGR-Nqo0YPpUyZdAIxLTkzHCG8YeV1tDFzgQKQgPTe1VvMML8WWzK2mQn0XbVCnI2WXD_MvOgvnkC3Kcl9FCM6MZ9ByJHpZmLXZeEZtuBQZuCJmIxVIvNmS3luJQy';
      expect(validateToken(validToken)).toBe(true);
    });

    it('should return false for tokens that are too short', () => {
      const shortToken = 'short:token';
      expect(validateToken(shortToken)).toBe(false);
    });

    it('should return false for tokens without a colon', () => {
      const noColonToken = 'fMEQJLC7PUIbHxN8GlSUqGGRNqo0YPpUyZdAIxLTkzHCG8YeV1tDFzgQKQgPTe1VvMML8WWzK2mQn0XbVCnI2WXD_MvOgvnkC3Kcl9FCM6MZ9ByJHpZmLXZeEZtuBQZuCJmIxVIvNmS3luJQy';
      expect(validateToken(noColonToken)).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(validateToken('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateToken(null as unknown as string)).toBe(false);
      expect(validateToken(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validateTopic', () => {
    it('should return true for valid topic names', () => {
      expect(validateTopic('news')).toBe(true);
      expect(validateTopic('weather_alerts')).toBe(true);
      expect(validateTopic('user-123')).toBe(true);
      expect(validateTopic('finance.stocks')).toBe(true);
    });

    it('should return false for topics with invalid characters', () => {
      expect(validateTopic('invalid topic')).toBe(false); // space
      expect(validateTopic('topic#invalid')).toBe(false); // #
      expect(validateTopic('topic/invalid')).toBe(false); // /
    });

    it('should return false for empty strings', () => {
      expect(validateTopic('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateTopic(null as unknown as string)).toBe(false);
      expect(validateTopic(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validateCondition', () => {
    it('should return true for valid condition expressions', () => {
      expect(validateCondition("'stock-updates' in topics && 'industry-finance' in topics")).toBe(true);
      expect(validateCondition("'news' in topics || 'events' in topics")).toBe(true);
      expect(validateCondition("'weather' in topics && ('local' in topics || 'national' in topics)")).toBe(true);
    });

    it('should return false for conditions without "in topics"', () => {
      expect(validateCondition('stock-updates && industry-finance')).toBe(false);
    });

    it('should return false for conditions without logical operators', () => {
      expect(validateCondition("'news' in topics")).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(validateCondition('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateCondition(null as unknown as string)).toBe(false);
      expect(validateCondition(undefined as unknown as string)).toBe(false);
    });
  });

  describe('validateMessagePayload', () => {
    it('should return true for valid payloads with notification', () => {
      const payload = {
        notification: {
          title: 'Test Title',
          body: 'Test Body'
        }
      };
      expect(validateMessagePayload(payload)).toBe(true);
    });

    it('should return true for valid payloads with data', () => {
      const payload = {
        data: {
          key1: 'value1',
          key2: 'value2'
        }
      };
      expect(validateMessagePayload(payload)).toBe(true);
    });

    it('should return true for valid payloads with both notification and data', () => {
      const payload = {
        notification: {
          title: 'Test Title',
          body: 'Test Body'
        },
        data: {
          key1: 'value1',
          key2: 'value2'
        }
      };
      expect(validateMessagePayload(payload)).toBe(true);
    });

    it('should return false for payloads without notification or data', () => {
      const payload = { someOtherField: 'value' };
      expect(validateMessagePayload(payload)).toBe(false);
    });

    it('should return false for payloads with invalid notification type', () => {
      const payload = { notification: 'not an object' };
      expect(validateMessagePayload(payload)).toBe(false);
    });

    it('should return false for payloads with invalid data type', () => {
      const payload = { data: 'not an object' };
      expect(validateMessagePayload(payload)).toBe(false);
    });

    it('should return false for empty objects', () => {
      expect(validateMessagePayload({})).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateMessagePayload(null)).toBe(false);
      expect(validateMessagePayload(undefined)).toBe(false);
    });
  });

  describe('validateAndroidConfig', () => {
    it('should return true for valid Android config', () => {
      const config = {
        priority: 'high',
        ttl: '86400s',
        notification: {
          sound: 'default',
          clickAction: 'OPEN_ACTIVITY'
        }
      };
      expect(validateAndroidConfig(config)).toBe(true);
    });

    it('should return false for invalid priority value', () => {
      const config = {
        priority: 'invalid-priority',
        notification: { sound: 'default' }
      };
      expect(validateAndroidConfig(config)).toBe(false);
    });

    it('should return false for invalid ttl format', () => {
      const config = {
        ttl: 'invalid-ttl',
        notification: { sound: 'default' }
      };
      expect(validateAndroidConfig(config)).toBe(false);
    });

    it('should return false for invalid notification type', () => {
      const config = {
        priority: 'high',
        notification: 'not-an-object'
      };
      expect(validateAndroidConfig(config)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateAndroidConfig(null)).toBe(false);
      expect(validateAndroidConfig(undefined)).toBe(false);
    });
  });

  describe('validateApnsConfig', () => {
    it('should return true for valid APNS config', () => {
      const config = {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            alert: {
              title: 'Test Title',
              body: 'Test Body'
            },
            sound: 'default'
          }
        }
      };
      expect(validateApnsConfig(config)).toBe(true);
    });

    it('should return false for invalid headers type', () => {
      const config = {
        headers: 'not-an-object',
        payload: { aps: { alert: { title: 'Test' } } }
      };
      expect(validateApnsConfig(config)).toBe(false);
    });

    it('should return false for invalid payload type', () => {
      const config = {
        headers: { 'apns-priority': '10' },
        payload: 'not-an-object'
      };
      expect(validateApnsConfig(config)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateApnsConfig(null)).toBe(false);
      expect(validateApnsConfig(undefined)).toBe(false);
    });
  });

  describe('validateJsonFormat', () => {
    it('should return true for valid JSON strings', () => {
      expect(validateJsonFormat('{"key": "value"}')).toBe(true);
      expect(validateJsonFormat('{"nested": {"key": "value"}}')).toBe(true);
      expect(validateJsonFormat('{"array": [1, 2, 3]}')).toBe(true);
    });

    it('should return false for invalid JSON strings', () => {
      expect(validateJsonFormat('{"key": value}')).toBe(false); // missing quotes
      expect(validateJsonFormat('{"key": "value"')).toBe(false); // missing closing brace
      expect(validateJsonFormat('not json')).toBe(false); // not JSON at all
    });

    it('should return false for JSON strings that parse to non-objects', () => {
      expect(validateJsonFormat('"string"')).toBe(false); // string
      expect(validateJsonFormat('123')).toBe(false); // number
      expect(validateJsonFormat('true')).toBe(false); // boolean
    });

    it('should return false for empty strings', () => {
      expect(validateJsonFormat('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateJsonFormat(null as unknown as string)).toBe(false);
      expect(validateJsonFormat(undefined as unknown as string)).toBe(false);
    });
  });
}); 