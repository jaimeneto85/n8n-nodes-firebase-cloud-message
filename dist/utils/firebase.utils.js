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
exports.initializeFirebase = initializeFirebase;
exports.validateAndInitializeFirebase = validateAndInitializeFirebase;
exports.getMessaging = getMessaging;
const admin = __importStar(require("firebase-admin"));
/**
 * Initializes Firebase Admin SDK with the provided credentials
 * @param credentials The Firebase credentials
 * @returns The initialized Firebase app instance
 */
async function initializeFirebase(credentials) {
    try {
        // Parse service account key
        const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        const projectId = serviceAccountKey.project_id;
        // Use project ID as app name for multiple app support
        const appName = projectId;
        // Check if app is already initialized
        try {
            const existingApp = admin.app(appName);
            return existingApp;
        }
        catch (error) {
            // App doesn't exist, create new one
            const initOptions = {
                credential: admin.credential.cert(serviceAccountKey),
            };
            // Add optional configurations if provided
            if (credentials.databaseURL) {
                initOptions.databaseURL = credentials.databaseURL;
            }
            if (credentials.storageBucket) {
                initOptions.storageBucket = credentials.storageBucket;
            }
            // Initialize Firebase with all configured options
            return admin.initializeApp(initOptions, appName);
        }
    }
    catch (error) {
        throw new Error(`Failed to initialize Firebase: ${error.message}`);
    }
}
/**
 * Validates Firebase credentials and returns the initialized app
 * @param credentials The Firebase credentials
 * @returns The initialized Firebase app instance
 */
async function validateAndInitializeFirebase(credentials) {
    // Validate service account key
    if (!credentials.serviceAccountKey) {
        throw new Error('Service Account Key is required');
    }
    try {
        // Parse service account key to validate JSON format
        const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        // Check required fields
        const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
        const missingFields = requiredFields.filter(field => !serviceAccountKey[field]);
        if (missingFields.length > 0) {
            throw new Error(`Service Account JSON is missing required fields: ${missingFields.join(', ')}`);
        }
        // Validate that it's a service account
        if (serviceAccountKey.type !== 'service_account') {
            throw new Error('Invalid credential type. Must be a service_account.');
        }
        // Initialize Firebase
        return await initializeFirebase(credentials);
    }
    catch (error) {
        if (error.message.includes('Failed to parse')) {
            throw new Error('Invalid Service Account JSON format');
        }
        throw error;
    }
}
/**
 * Gets a Firebase messaging instance from an initialized app
 * @param app The Firebase app instance
 * @returns The Firebase messaging instance
 */
function getMessaging(app) {
    try {
        return app ? admin.messaging(app) : admin.messaging();
    }
    catch (error) {
        throw new Error(`Failed to get Firebase messaging instance: ${error.message}`);
    }
}
//# sourceMappingURL=firebase.utils.js.map