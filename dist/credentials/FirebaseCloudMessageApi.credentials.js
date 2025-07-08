"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseCloudMessageApi = void 0;
class FirebaseCloudMessageApi {
    constructor() {
        this.name = 'firebaseCloudMessageApi';
        this.displayName = 'Firebase Cloud Message API';
        this.documentationUrl = 'https://firebase.google.com/docs/cloud-messaging';
        this.properties = [
            {
                displayName: 'Authentication Method',
                name: 'authType',
                type: 'options',
                options: [
                    {
                        name: 'OAuth2',
                        value: 'oauth2',
                        description: 'Use OAuth2 authentication with Google Cloud (recommended)',
                    },
                    {
                        name: 'Service Account (Legacy)',
                        value: 'serviceAccount',
                        description: 'Use service account JSON key (legacy method - deprecated)',
                    },
                ],
                default: 'oauth2',
                description: 'Choose the authentication method',
            },
            {
                displayName: 'Project ID',
                name: 'projectId',
                type: 'string',
                default: '',
                required: true,
                description: 'Your Firebase project ID (found in Firebase Console > Project Settings)',
                placeholder: 'my-firebase-project',
                displayOptions: {
                    show: {
                        authType: ['oauth2'],
                    },
                },
            },
            {
                displayName: 'Client ID',
                name: 'clientId',
                type: 'string',
                default: '',
                required: true,
                description: 'OAuth2 Client ID from Google Cloud Console > APIs & Services > Credentials. Create a new OAuth 2.0 Client ID if needed.',
                placeholder: '123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
                displayOptions: {
                    show: {
                        authType: ['oauth2'],
                    },
                },
            },
            {
                displayName: 'Client Secret',
                name: 'clientSecret',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'OAuth2 Client Secret from Google Cloud Console > APIs & Services > Credentials',
                displayOptions: {
                    show: {
                        authType: ['oauth2'],
                    },
                },
            },
            {
                displayName: 'Refresh Token',
                name: 'refreshToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'OAuth2 Refresh Token. Use Google OAuth2 Playground (https://developers.google.com/oauthplayground) to generate this token with Firebase Cloud Messaging API scope.',
                displayOptions: {
                    show: {
                        authType: ['oauth2'],
                    },
                },
            },
            {
                displayName: 'Service Account JSON',
                name: 'serviceAccountKey',
                type: 'string',
                typeOptions: {
                    password: true,
                    rows: 10,
                },
                default: '',
                description: 'Cole aqui o JSON completo baixado do Firebase Console > Project Settings > Service Accounts > Generate new private key',
                required: true,
                placeholder: '{\n  "type": "service_account",\n  "project_id": "your-project-id",\n  "private_key_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",\n  "client_email": "...@your-project-id.iam.gserviceaccount.com",\n  ...\n}',
                displayOptions: {
                    show: {
                        authType: ['serviceAccount'],
                    },
                },
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {},
        };
        this.test = {
            request: {
                baseURL: 'https://fcm.googleapis.com/v1/projects',
                url: '={{$credentials.authType === "oauth2" ? $credentials.projectId : JSON.parse($credentials.serviceAccountKey).project_id}}',
                method: 'GET',
            },
        };
    }
    async validateCredentials(credentials) {
        try {
            const authType = credentials.authType || 'oauth2';
            if (authType === 'oauth2') {
                // Validate OAuth2 credentials
                const requiredFields = ['projectId', 'clientId', 'clientSecret', 'refreshToken'];
                const missingFields = requiredFields.filter(field => !credentials[field]);
                if (missingFields.length > 0) {
                    return {
                        isValid: false,
                        errorMessage: `OAuth2 credentials incomplete. Missing fields: ${missingFields.join(', ')}`,
                    };
                }
                // Basic format validation
                const clientId = credentials.clientId;
                if (!clientId.includes('.apps.googleusercontent.com')) {
                    return {
                        isValid: false,
                        errorMessage: 'Client ID format invalid. Should end with .apps.googleusercontent.com',
                    };
                }
                const projectId = credentials.projectId;
                if (!/^[a-z0-9-]+$/.test(projectId)) {
                    return {
                        isValid: false,
                        errorMessage: 'Project ID format invalid. Should contain only lowercase letters, numbers, and hyphens',
                    };
                }
            }
            else {
                // Validate Service Account credentials (legacy)
                if (!credentials.serviceAccountKey || typeof credentials.serviceAccountKey !== 'string') {
                    return {
                        isValid: false,
                        errorMessage: 'Service Account JSON é obrigatório',
                    };
                }
                const serviceAccount = JSON.parse(credentials.serviceAccountKey);
                const requiredFields = [
                    'type',
                    'project_id',
                    'private_key_id',
                    'private_key',
                    'client_email',
                    'client_id',
                ];
                const missingFields = requiredFields.filter(field => !serviceAccount[field]);
                if (missingFields.length > 0) {
                    return {
                        isValid: false,
                        errorMessage: `JSON inválido. Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
                    };
                }
                if (serviceAccount.type !== 'service_account') {
                    return {
                        isValid: false,
                        errorMessage: 'Tipo de credencial inválido. Deve ser "service_account"',
                    };
                }
            }
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? `Validation error: ${error.message}` : 'Invalid credentials format',
            };
        }
    }
}
exports.FirebaseCloudMessageApi = FirebaseCloudMessageApi;
//# sourceMappingURL=FirebaseCloudMessageApi.credentials.js.map