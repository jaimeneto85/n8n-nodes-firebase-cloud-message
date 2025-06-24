"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const firebase_utils_1 = require("../utils/firebase.utils");
// Mock Firebase Admin modules
jest.mock('firebase-admin', () => {
    // Create mock implementations
    const appMock = {
        name: 'test-app',
    };
    const messagingMock = {
        send: jest.fn(),
    };
    return {
        app: jest.fn((name) => {
            if (name === 'valid-project-id') {
                return appMock;
            }
            else if (name === 'throw-error') {
                throw new Error('App not found');
            }
            else {
                throw new Error(`App named ${name} does not exist`);
            }
        }),
        initializeApp: jest.fn((options, name) => {
            if (name === 'error-project-id') {
                throw new Error('Failed to initialize app');
            }
            return appMock;
        }),
        credential: {
            cert: jest.fn((serviceAccount) => serviceAccount),
        },
        messaging: jest.fn(() => messagingMock),
    };
});
describe('Firebase Utilities', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('initializeFirebase', () => {
        it('should return existing app if already initialized', async () => {
            const credentials = {
                serviceAccountKey: JSON.stringify({
                    project_id: 'valid-project-id',
                    private_key: 'private-key',
                    client_email: 'email@example.com',
                }),
            };
            const app = await (0, firebase_utils_1.initializeFirebase)(credentials);
            expect(app).toBeDefined();
            expect(admin.app).toHaveBeenCalledWith('valid-project-id');
            expect(admin.initializeApp).not.toHaveBeenCalled();
        });
        it('should initialize new app if not already initialized', async () => {
            const credentials = {
                serviceAccountKey: JSON.stringify({
                    project_id: 'new-project-id',
                    private_key: 'private-key',
                    client_email: 'email@example.com',
                }),
                databaseURL: 'https://example.firebaseio.com',
                storageBucket: 'example.appspot.com',
            };
            const app = await (0, firebase_utils_1.initializeFirebase)(credentials);
            expect(app).toBeDefined();
            expect(admin.app).toHaveBeenCalledWith('new-project-id');
            expect(admin.initializeApp).toHaveBeenCalledWith({
                credential: expect.anything(),
                databaseURL: 'https://example.firebaseio.com',
                storageBucket: 'example.appspot.com',
            }, 'new-project-id');
        });
        it('should throw error if initialization fails', async () => {
            const credentials = {
                serviceAccountKey: 'invalid-json',
            };
            await expect((0, firebase_utils_1.initializeFirebase)(credentials)).rejects.toThrow('Failed to initialize Firebase: Unexpected token i in JSON at position 0');
        });
    });
    describe('validateAndInitializeFirebase', () => {
        it('should validate and initialize firebase with valid credentials', async () => {
            const credentials = {
                serviceAccountKey: JSON.stringify({
                    type: 'service_account',
                    project_id: 'valid-project-id',
                    private_key_id: 'key-id',
                    private_key: 'private-key',
                    client_email: 'email@example.com',
                    client_id: 'client-id',
                }),
            };
            const app = await (0, firebase_utils_1.validateAndInitializeFirebase)(credentials);
            expect(app).toBeDefined();
        });
        it('should throw error if serviceAccountKey is missing', async () => {
            const credentials = {};
            await expect((0, firebase_utils_1.validateAndInitializeFirebase)(credentials)).rejects.toThrow('Service Account Key is required');
        });
        it('should throw error if serviceAccountKey is invalid JSON', async () => {
            const credentials = {
                serviceAccountKey: 'invalid-json',
            };
            await expect((0, firebase_utils_1.validateAndInitializeFirebase)(credentials)).rejects.toThrow('Invalid Service Account JSON format');
        });
        it('should throw error if required fields are missing', async () => {
            const credentials = {
                serviceAccountKey: JSON.stringify({
                    type: 'service_account',
                    project_id: 'test-project',
                    // Missing other required fields
                }),
            };
            await expect((0, firebase_utils_1.validateAndInitializeFirebase)(credentials)).rejects.toThrow('Service Account JSON is missing required fields');
        });
        it('should throw error if credential type is not service_account', async () => {
            const credentials = {
                serviceAccountKey: JSON.stringify({
                    type: 'not_service_account',
                    project_id: 'test-project',
                    private_key_id: 'key-id',
                    private_key: 'private-key',
                    client_email: 'email@example.com',
                    client_id: 'client-id',
                }),
            };
            await expect((0, firebase_utils_1.validateAndInitializeFirebase)(credentials)).rejects.toThrow('Invalid credential type. Must be a service_account.');
        });
    });
    describe('getMessaging', () => {
        it('should return messaging instance with provided app', () => {
            const app = { name: 'test-app' };
            const messaging = (0, firebase_utils_1.getMessaging)(app);
            expect(messaging).toBeDefined();
            expect(admin.messaging).toHaveBeenCalledWith(app);
        });
        it('should return default messaging instance when no app provided', () => {
            const messaging = (0, firebase_utils_1.getMessaging)();
            expect(messaging).toBeDefined();
            expect(admin.messaging).toHaveBeenCalledWith();
        });
        it('should throw error when messaging fails', () => {
            jest.spyOn(admin, 'messaging').mockImplementationOnce(() => {
                throw new Error('Messaging error');
            });
            expect(() => (0, firebase_utils_1.getMessaging)()).toThrow('Failed to get Firebase messaging instance: Messaging error');
        });
    });
});
//# sourceMappingURL=firebase.utils.test.js.map