"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_utils_1 = require("../utils/validation.utils");
describe('Validation Utilities', () => {
    describe('validateToken', () => {
        it('should return true for valid FCM tokens', () => {
            const validToken = 'fMEQJLC7PUI:APA91bHxN8GlSUqGGR-Nqo0YPpUyZdAIxLTkzHCG8YeV1tDFzgQKQgPTe1VvMML8WWzK2mQn0XbVCnI2WXD_MvOgvnkC3Kcl9FCM6MZ9ByJHpZmLXZeEZtuBQZuCJmIxVIvNmS3luJQy';
            expect((0, validation_utils_1.validateToken)(validToken)).toBe(true);
        });
        it('should return false for tokens that are too short', () => {
            const shortToken = 'short:token';
            expect((0, validation_utils_1.validateToken)(shortToken)).toBe(false);
        });
        it('should return false for tokens without a colon', () => {
            const noColonToken = 'fMEQJLC7PUIbHxN8GlSUqGGRNqo0YPpUyZdAIxLTkzHCG8YeV1tDFzgQKQgPTe1VvMML8WWzK2mQn0XbVCnI2WXD_MvOgvnkC3Kcl9FCM6MZ9ByJHpZmLXZeEZtuBQZuCJmIxVIvNmS3luJQy';
            expect((0, validation_utils_1.validateToken)(noColonToken)).toBe(false);
        });
        it('should return false for empty strings', () => {
            expect((0, validation_utils_1.validateToken)('')).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateToken)(null)).toBe(false);
            expect((0, validation_utils_1.validateToken)(undefined)).toBe(false);
        });
    });
    describe('validateTopic', () => {
        it('should return true for valid topic names', () => {
            expect((0, validation_utils_1.validateTopic)('news')).toBe(true);
            expect((0, validation_utils_1.validateTopic)('weather_alerts')).toBe(true);
            expect((0, validation_utils_1.validateTopic)('user-123')).toBe(true);
            expect((0, validation_utils_1.validateTopic)('finance.stocks')).toBe(true);
        });
        it('should return false for topics with invalid characters', () => {
            expect((0, validation_utils_1.validateTopic)('invalid topic')).toBe(false); // space
            expect((0, validation_utils_1.validateTopic)('topic#invalid')).toBe(false); // #
            expect((0, validation_utils_1.validateTopic)('topic/invalid')).toBe(false); // /
        });
        it('should return false for empty strings', () => {
            expect((0, validation_utils_1.validateTopic)('')).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateTopic)(null)).toBe(false);
            expect((0, validation_utils_1.validateTopic)(undefined)).toBe(false);
        });
    });
    describe('validateCondition', () => {
        it('should return true for valid condition expressions', () => {
            expect((0, validation_utils_1.validateCondition)("'stock-updates' in topics && 'industry-finance' in topics")).toBe(true);
            expect((0, validation_utils_1.validateCondition)("'news' in topics || 'events' in topics")).toBe(true);
            expect((0, validation_utils_1.validateCondition)("'weather' in topics && ('local' in topics || 'national' in topics)")).toBe(true);
        });
        it('should return false for conditions without "in topics"', () => {
            expect((0, validation_utils_1.validateCondition)('stock-updates && industry-finance')).toBe(false);
        });
        it('should return false for conditions without logical operators', () => {
            expect((0, validation_utils_1.validateCondition)("'news' in topics")).toBe(false);
        });
        it('should return false for empty strings', () => {
            expect((0, validation_utils_1.validateCondition)('')).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateCondition)(null)).toBe(false);
            expect((0, validation_utils_1.validateCondition)(undefined)).toBe(false);
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
            expect((0, validation_utils_1.validateMessagePayload)(payload)).toBe(true);
        });
        it('should return true for valid payloads with data', () => {
            const payload = {
                data: {
                    key1: 'value1',
                    key2: 'value2'
                }
            };
            expect((0, validation_utils_1.validateMessagePayload)(payload)).toBe(true);
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
            expect((0, validation_utils_1.validateMessagePayload)(payload)).toBe(true);
        });
        it('should return false for payloads without notification or data', () => {
            const payload = { someOtherField: 'value' };
            expect((0, validation_utils_1.validateMessagePayload)(payload)).toBe(false);
        });
        it('should return false for payloads with invalid notification type', () => {
            const payload = { notification: 'not an object' };
            expect((0, validation_utils_1.validateMessagePayload)(payload)).toBe(false);
        });
        it('should return false for payloads with invalid data type', () => {
            const payload = { data: 'not an object' };
            expect((0, validation_utils_1.validateMessagePayload)(payload)).toBe(false);
        });
        it('should return false for empty objects', () => {
            expect((0, validation_utils_1.validateMessagePayload)({})).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateMessagePayload)(null)).toBe(false);
            expect((0, validation_utils_1.validateMessagePayload)(undefined)).toBe(false);
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
            expect((0, validation_utils_1.validateAndroidConfig)(config)).toBe(true);
        });
        it('should return false for invalid priority value', () => {
            const config = {
                priority: 'invalid-priority',
                notification: { sound: 'default' }
            };
            expect((0, validation_utils_1.validateAndroidConfig)(config)).toBe(false);
        });
        it('should return false for invalid ttl format', () => {
            const config = {
                ttl: 'invalid-ttl',
                notification: { sound: 'default' }
            };
            expect((0, validation_utils_1.validateAndroidConfig)(config)).toBe(false);
        });
        it('should return false for invalid notification type', () => {
            const config = {
                priority: 'high',
                notification: 'not-an-object'
            };
            expect((0, validation_utils_1.validateAndroidConfig)(config)).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateAndroidConfig)(null)).toBe(false);
            expect((0, validation_utils_1.validateAndroidConfig)(undefined)).toBe(false);
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
            expect((0, validation_utils_1.validateApnsConfig)(config)).toBe(true);
        });
        it('should return false for invalid headers type', () => {
            const config = {
                headers: 'not-an-object',
                payload: { aps: { alert: { title: 'Test' } } }
            };
            expect((0, validation_utils_1.validateApnsConfig)(config)).toBe(false);
        });
        it('should return false for invalid payload type', () => {
            const config = {
                headers: { 'apns-priority': '10' },
                payload: 'not-an-object'
            };
            expect((0, validation_utils_1.validateApnsConfig)(config)).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateApnsConfig)(null)).toBe(false);
            expect((0, validation_utils_1.validateApnsConfig)(undefined)).toBe(false);
        });
    });
    describe('validateJsonFormat', () => {
        it('should return true for valid JSON strings', () => {
            expect((0, validation_utils_1.validateJsonFormat)('{"key": "value"}')).toBe(true);
            expect((0, validation_utils_1.validateJsonFormat)('{"nested": {"key": "value"}}')).toBe(true);
            expect((0, validation_utils_1.validateJsonFormat)('{"array": [1, 2, 3]}')).toBe(true);
        });
        it('should return false for invalid JSON strings', () => {
            expect((0, validation_utils_1.validateJsonFormat)('{"key": value}')).toBe(false); // missing quotes
            expect((0, validation_utils_1.validateJsonFormat)('{"key": "value"')).toBe(false); // missing closing brace
            expect((0, validation_utils_1.validateJsonFormat)('not json')).toBe(false); // not JSON at all
        });
        it('should return false for JSON strings that parse to non-objects', () => {
            expect((0, validation_utils_1.validateJsonFormat)('"string"')).toBe(false); // string
            expect((0, validation_utils_1.validateJsonFormat)('123')).toBe(false); // number
            expect((0, validation_utils_1.validateJsonFormat)('true')).toBe(false); // boolean
        });
        it('should return false for empty strings', () => {
            expect((0, validation_utils_1.validateJsonFormat)('')).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, validation_utils_1.validateJsonFormat)(null)).toBe(false);
            expect((0, validation_utils_1.validateJsonFormat)(undefined)).toBe(false);
        });
    });
});
//# sourceMappingURL=validation.utils.test.js.map