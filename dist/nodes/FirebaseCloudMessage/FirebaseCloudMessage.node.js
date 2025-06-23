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
exports.FirebaseCloudMessage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const admin = __importStar(require("firebase-admin"));
class FirebaseCloudMessage {
    constructor() {
        this.description = {
            displayName: 'Firebase Cloud Message',
            name: 'firebaseCloudMessage',
            icon: 'file:firebase.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Send notifications via Firebase Cloud Messaging',
            defaults: {
                name: 'Firebase Cloud Message',
            },
            inputs: [
                {
                    displayName: 'Main',
                    type: "main" /* NodeConnectionType.Main */,
                    required: true,
                },
            ],
            outputs: [
                {
                    displayName: 'Main',
                    type: "main" /* NodeConnectionType.Main */,
                },
            ],
            credentials: [
                {
                    name: 'firebaseCloudMessageApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Send to Token',
                            value: 'sendToToken',
                            description: 'Send message to a specific device token',
                            action: 'Send message to a specific device token',
                        },
                    ],
                    default: 'sendToToken',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        // Initialize Firebase Admin SDK
        const credentials = await this.getCredentials('firebaseCloudMessageApi');
        let firebaseApp;
        try {
            const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
            // Check if the app has already been initialized
            try {
                firebaseApp = admin.app();
            }
            catch (error) {
                // Initialize the app with all credential options
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
                firebaseApp = admin.initializeApp(initOptions);
            }
            // Log successful initialization
            this.logger.info('Firebase Cloud Messaging initialized successfully');
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Firebase initialization failed: ${error.message}`, { itemIndex: 0 });
        }
        // Implement sending logic based on selected operation (to be expanded in future tasks)
        const operation = this.getNodeParameter('operation', 0);
        try {
            if (operation === 'sendToToken') {
                this.logger.debug('Send to token operation selected, but not yet implemented fully');
                // Implementation will be added in future tasks
            }
            return [items];
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Firebase Cloud Messaging operation failed: ${error.message}`, { itemIndex: 0 });
        }
    }
}
exports.FirebaseCloudMessage = FirebaseCloudMessage;
//# sourceMappingURL=FirebaseCloudMessage.node.js.map