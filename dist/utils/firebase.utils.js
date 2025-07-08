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
exports.clearTokenCache = clearTokenCache;
const admin = __importStar(require("firebase-admin"));
/**
 * OAuth2 token cache to avoid unnecessary requests
 */
const tokenCache = new Map();
/**
 * Gets an OAuth2 access token for Google Cloud/Firebase
 * @param credentials The OAuth2 credentials
 * @returns The access token
 */
async function getOAuth2AccessToken(credentials) {
    const clientId = credentials.clientId;
    const clientSecret = credentials.clientSecret;
    const refreshToken = credentials.refreshToken;
    // Check cache first
    const cacheKey = `${clientId}:${refreshToken}`;
    const cached = tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.token;
    }
    // Request new token
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OAuth2 token request failed: ${response.status} - ${errorData}`);
    }
    const tokenData = await response.json();
    if (!tokenData.access_token) {
        throw new Error('No access token in OAuth2 response');
    }
    // Cache the token (expires in ~1 hour, cache for 50 minutes to be safe)
    const expiresIn = tokenData.expires_in || 3600;
    const expiresAt = Date.now() + (expiresIn - 600) * 1000; // 10 minutes buffer
    tokenCache.set(cacheKey, {
        token: tokenData.access_token,
        expiresAt,
    });
    return tokenData.access_token;
}
/**
 * Creates a custom credential for OAuth2 authentication
 * @param credentials The OAuth2 credentials
 * @returns A custom credential object
 */
async function createOAuth2Credential(credentials) {
    return {
        getAccessToken: async () => {
            const token = await getOAuth2AccessToken(credentials);
            return { access_token: token };
        },
    };
}
/**
 * Initializes Firebase Admin SDK with the provided credentials
 * @param credentials The Firebase credentials (OAuth2 or Service Account)
 * @returns The initialized Firebase app instance
 */
async function initializeFirebase(credentials) {
    try {
        const authType = credentials.authType || 'oauth2';
        let projectId;
        let appName;
        if (authType === 'oauth2') {
            projectId = credentials.projectId;
            appName = `oauth2-${projectId}`;
        }
        else {
            // Service Account (legacy)
            const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
            projectId = serviceAccountKey.project_id;
            appName = `sa-${projectId}`;
        }
        // Check if app is already initialized
        try {
            const existingApp = admin.app(appName);
            return existingApp;
        }
        catch (error) {
            // App doesn't exist, create new one
            let initOptions;
            if (authType === 'oauth2') {
                // OAuth2 authentication
                const oauth2Credential = await createOAuth2Credential(credentials);
                initOptions = {
                    credential: admin.credential.refreshToken(oauth2Credential),
                    projectId,
                };
            }
            else {
                // Service Account authentication (legacy)
                const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
                initOptions = {
                    credential: admin.credential.cert(serviceAccountKey),
                    projectId,
                };
            }
            // Initialize Firebase with configured options
            return admin.initializeApp(initOptions, appName);
        }
    }
    catch (error) {
        throw new Error(`Failed to initialize Firebase: ${error.message}`);
    }
}
/**
 * Validates Firebase credentials and returns the initialized app
 * @param credentials The Firebase credentials (OAuth2 or Service Account)
 * @returns The initialized Firebase app instance
 */
async function validateAndInitializeFirebase(credentials) {
    const authType = credentials.authType || 'oauth2';
    if (authType === 'oauth2') {
        // Validate OAuth2 credentials
        const requiredFields = ['projectId', 'clientId', 'clientSecret', 'refreshToken'];
        const missingFields = requiredFields.filter(field => !credentials[field]);
        if (missingFields.length > 0) {
            throw new Error(`OAuth2 credentials incomplete. Missing: ${missingFields.join(', ')}`);
        }
        // Test OAuth2 token retrieval
        try {
            await getOAuth2AccessToken(credentials);
        }
        catch (error) {
            throw new Error(`OAuth2 authentication failed: ${error.message}`);
        }
    }
    else {
        // Validate Service Account credentials (legacy)
        if (!credentials.serviceAccountKey) {
            throw new Error('Service Account JSON é obrigatório');
        }
        try {
            const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
            const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
            const missingFields = requiredFields.filter(field => !serviceAccountKey[field]);
            if (missingFields.length > 0) {
                throw new Error(`Service Account JSON inválido. Campos ausentes: ${missingFields.join(', ')}`);
            }
            if (serviceAccountKey.type !== 'service_account') {
                throw new Error('Tipo de credencial inválido. Deve ser "service_account"');
            }
        }
        catch (error) {
            if (error.message.includes('Failed to parse') || error.message.includes('Unexpected token')) {
                throw new Error('Formato JSON inválido. Verifique se o JSON está correto');
            }
            throw error;
        }
    }
    // Initialize Firebase
    return await initializeFirebase(credentials);
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
/**
 * Clears the OAuth2 token cache (useful for testing or credential changes)
 */
function clearTokenCache() {
    tokenCache.clear();
}
//# sourceMappingURL=firebase.utils.js.map