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
                displayName: 'Service Account Key',
                name: 'serviceAccountKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Service account key JSON for Firebase Cloud Messaging',
                required: true,
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {},
        };
    }
}
exports.FirebaseCloudMessageApi = FirebaseCloudMessageApi;
//# sourceMappingURL=FirebaseCloudMessageApi.credentials.js.map