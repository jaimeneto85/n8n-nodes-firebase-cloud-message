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
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {},
        };
        this.test = {
            request: {
                baseURL: 'https://fcm.googleapis.com/v1/projects',
                url: '={{JSON.parse($credentials.serviceAccountKey).project_id}}',
                method: 'GET',
            },
        };
    }
    async validateCredentials(credentials) {
        try {
            if (!credentials.serviceAccountKey || typeof credentials.serviceAccountKey !== 'string') {
                return {
                    isValid: false,
                    errorMessage: 'Service Account JSON é obrigatório',
                };
            }
            const serviceAccount = JSON.parse(credentials.serviceAccountKey);
            // Validar campos obrigatórios
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
            if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
                return {
                    isValid: false,
                    errorMessage: 'Formato de chave privada inválido',
                };
            }
            if (!serviceAccount.client_email.includes('@') || !serviceAccount.client_email.endsWith('.iam.gserviceaccount.com')) {
                return {
                    isValid: false,
                    errorMessage: 'Email do cliente inválido. Deve terminar com .iam.gserviceaccount.com',
                };
            }
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? `JSON inválido: ${error.message}` : 'Formato JSON inválido',
            };
        }
    }
}
exports.FirebaseCloudMessageApi = FirebaseCloudMessageApi;
//# sourceMappingURL=FirebaseCloudMessageApi.credentials.js.map