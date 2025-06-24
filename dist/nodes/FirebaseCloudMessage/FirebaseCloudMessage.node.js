"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseCloudMessage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const FirebaseCloudMessageApi_credentials_1 = require("../../credentials/FirebaseCloudMessageApi.credentials");
const firebase_utils_1 = require("../../utils/firebase.utils");
const validation_utils_1 = require("../../utils/validation.utils");
class FirebaseCloudMessage {
    constructor() {
        this.description = {
            displayName: 'Firebase Cloud Message',
            name: 'firebaseCloudMessage',
            icon: 'file:icons/firebase.svg',
            group: ['output', 'notification'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Send push notifications via Firebase Cloud Messaging',
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
                        {
                            name: 'Send to Topic',
                            value: 'sendToTopic',
                            description: 'Send message to a topic',
                            action: 'Send message to a topic',
                        },
                        {
                            name: 'Send to Condition',
                            value: 'sendToCondition',
                            description: 'Send message based on a condition',
                            action: 'Send message based on a condition',
                        },
                        {
                            name: 'Subscribe to Topic',
                            value: 'subscribeToTopic',
                            description: 'Subscribe tokens to a topic',
                            action: 'Subscribe tokens to a topic',
                        },
                        {
                            name: 'Unsubscribe from Topic',
                            value: 'unsubscribeFromTopic',
                            description: 'Unsubscribe tokens from a topic',
                            action: 'Unsubscribe tokens from a topic',
                        },
                    ],
                    default: 'sendToToken',
                },
                // Token Fields - shown when sendToToken is selected
                {
                    displayName: 'Device Token',
                    name: 'deviceToken',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['sendToToken'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'The registration token or array of registration tokens to send a message to',
                    placeholder: 'c_TRalKu7Uk:APA91bE...',
                },
                {
                    displayName: 'Multiple Tokens',
                    name: 'multipleTokens',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            operation: ['sendToToken'],
                        },
                    },
                    default: false,
                    description: 'Whether to send to multiple tokens at once',
                },
                {
                    displayName: 'Device Tokens',
                    name: 'deviceTokens',
                    type: 'string',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            operation: ['sendToToken'],
                            multipleTokens: [true],
                        },
                    },
                    default: [],
                    required: true,
                    description: 'Array of device tokens to send to (maximum 500)',
                    placeholder: 'c_TRalKu7Uk:APA91bE...',
                },
                // Topic Fields - shown when sendToTopic is selected
                {
                    displayName: 'Topic',
                    name: 'topic',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['sendToTopic', 'subscribeToTopic', 'unsubscribeFromTopic'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'The topic name to send a message to',
                    placeholder: 'weather',
                },
                // Condition Fields - shown when sendToCondition is selected
                {
                    displayName: 'Condition',
                    name: 'condition',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['sendToCondition'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'Condition to evaluate against for conditional messaging (e.g. "\'weather\' in topics && (\'news\' in topics || \'traffic\' in topics)")',
                    placeholder: '\'weather\' in topics',
                },
                // Message Fields - common for all send operations
                {
                    displayName: 'Message',
                    name: 'message',
                    type: 'fixedCollection',
                    displayOptions: {
                        show: {
                            operation: ['sendToToken', 'sendToTopic', 'sendToCondition'],
                        },
                    },
                    default: {},
                    placeholder: 'Add Message Field',
                    typeOptions: {
                        multipleValues: false,
                    },
                    options: [
                        {
                            name: 'messageFields',
                            displayName: 'Message Fields',
                            values: [
                                {
                                    displayName: 'Title',
                                    name: 'title',
                                    type: 'string',
                                    default: '',
                                    description: 'The notification title',
                                },
                                {
                                    displayName: 'Body',
                                    name: 'body',
                                    type: 'string',
                                    default: '',
                                    description: 'The notification body text',
                                },
                                {
                                    displayName: 'Image URL',
                                    name: 'imageUrl',
                                    type: 'string',
                                    default: '',
                                    description: 'URL to the image to display in the notification',
                                },
                                {
                                    displayName: 'Priority',
                                    name: 'priority',
                                    type: 'options',
                                    options: [
                                        {
                                            name: 'Normal',
                                            value: 'normal',
                                            description: 'Regular priority for the notification',
                                        },
                                        {
                                            name: 'High',
                                            value: 'high',
                                            description: 'High priority notification that triggers immediate delivery',
                                        },
                                    ],
                                    default: 'normal',
                                    description: 'The priority of the message. On Android, high priority messages are shown as heads-up notifications.',
                                },
                                {
                                    displayName: 'Sound',
                                    name: 'sound',
                                    type: 'string',
                                    default: 'default',
                                    description: 'The sound to play when the device receives the notification. Specify "default" for default sound or a filename without extension for custom sound.',
                                },
                                {
                                    displayName: 'Click Action',
                                    name: 'clickAction',
                                    type: 'string',
                                    default: '',
                                    description: 'The action to take when the notification is clicked. For Android, this is the intent filter. For web, this is the URL to open.',
                                },
                                {
                                    displayName: 'Data',
                                    name: 'data',
                                    type: 'json',
                                    default: '{}',
                                    description: 'Custom key-value pairs for the message payload. These can be retrieved by the client app.',
                                    typeOptions: {
                                        alwaysOpenEditWindow: true,
                                    },
                                },
                            ],
                        },
                    ],
                },
                // Options for subscribe/unsubscribe operations
                {
                    displayName: 'Device Tokens',
                    name: 'registrationTokens',
                    type: 'string',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            operation: ['subscribeToTopic', 'unsubscribeFromTopic'],
                        },
                    },
                    default: [],
                    required: true,
                    description: 'Array of device tokens to subscribe/unsubscribe (maximum 1000)',
                },
                // JSON Mode
                {
                    displayName: 'JSON Parameters',
                    name: 'jsonParameters',
                    type: 'boolean',
                    default: false,
                    description: 'Use raw JSON for message configuration',
                },
                {
                    displayName: 'Message JSON',
                    name: 'messageJson',
                    type: 'json',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            jsonParameters: [true],
                            operation: ['sendToToken', 'sendToTopic', 'sendToCondition'],
                        },
                    },
                    description: 'Full message JSON payload',
                    typeOptions: {
                        alwaysOpenEditWindow: true,
                    },
                },
                {
                    displayName: 'Message Type',
                    name: 'messageType',
                    type: 'options',
                    options: [
                        {
                            name: 'Notification with Optional Data',
                            value: 'notification',
                            description: 'Send a notification that appears on the device with optional data payload',
                        },
                        {
                            name: 'Data Only',
                            value: 'dataOnly',
                            description: 'Send only a data message that is handled by the app and does not appear as a notification',
                        },
                    ],
                    default: 'notification',
                    description: 'The type of message to send',
                    displayOptions: {
                        show: {
                            jsonParameters: [
                                false,
                            ],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        // Get credentials
        const credentials = await this.getCredentials('firebaseCloudMessageApi');
        let firebaseApp;
        let projectId;
        try {
            // Initialize Firebase Admin SDK using our utility function
            firebaseApp = await (0, firebase_utils_1.validateAndInitializeFirebase)(credentials);
            // Get project ID from service account key
            const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
            projectId = serviceAccountKey.project_id;
            // Get the TokenManager instance from the credentials
            const credentialsObject = new FirebaseCloudMessageApi_credentials_1.FirebaseCloudMessageApi();
            const tokenManager = credentialsObject.getTokenManager();
            // Check if token caching is enabled
            const enableTokenCaching = credentials.enableTokenCaching !== false;
            // Function to generate a new Firebase token
            const generateFirebaseToken = async () => {
                this.logger.debug('Generating new Firebase authentication token');
                // For Firebase Admin SDK, we don't actually need to generate a token
                // since it handles token management internally, but we return a placeholder
                // to work with our token manager
                return `firebase-admin-token-${Date.now()}`;
            };
            // Get or generate the token if token caching is enabled
            if (enableTokenCaching) {
                await tokenManager.getToken(projectId, generateFirebaseToken);
                this.logger.debug('Using cached or new Firebase token');
            }
            // Log successful initialization
            this.logger.info('Firebase Cloud Messaging initialized successfully');
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Firebase initialization failed: ${error.message}`, { itemIndex: 0 });
        }
        // Execute operations based on selected operation
        const operation = this.getNodeParameter('operation', 0);
        try {
            // Process each item
            for (let i = 0; i < items.length; i++) {
                const jsonParameters = this.getNodeParameter('jsonParameters', i, false);
                if (operation === 'sendToToken') {
                    // Handle sending to token
                    this.logger.debug('Executing sendToToken operation');
                    let message;
                    if (jsonParameters) {
                        // Use JSON directly
                        const messageJson = this.getNodeParameter('messageJson', i);
                        message = JSON.parse(messageJson);
                    }
                    else {
                        // Build message from parameters
                        const multipleTokens = this.getNodeParameter('multipleTokens', i, false);
                        let token = '';
                        let tokens = [];
                        if (multipleTokens) {
                            tokens = this.getNodeParameter('deviceTokens', i, []);
                            if (tokens.length === 0) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one device token is required', { itemIndex: i });
                            }
                            if (tokens.length > 500) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Maximum of 500 tokens allowed in a single request', { itemIndex: i });
                            }
                        }
                        else {
                            token = this.getNodeParameter('deviceToken', i, '');
                            tokens = [token];
                            if (!token) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Device token is required', { itemIndex: i });
                            }
                        }
                        // Get notification content
                        const messageFields = this.getNodeParameter('message.messageFields', i, {});
                        const title = messageFields.title;
                        const body = messageFields.body;
                        const imageUrl = messageFields.imageUrl;
                        const priority = messageFields.priority;
                        const sound = messageFields.sound;
                        const clickAction = messageFields.clickAction;
                        const dataJson = messageFields.data;
                        const messageType = this.getNodeParameter('messageType', i, 'notification');
                        // Parse data payload if provided
                        let data;
                        if (dataJson && dataJson !== '{}') {
                            try {
                                data = JSON.parse(dataJson);
                                // Ensure all values are strings as required by FCM
                                if (data) {
                                    Object.keys(data).forEach(key => {
                                        if (data && typeof data[key] !== 'string') {
                                            data[key] = String(data[key]);
                                        }
                                    });
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid JSON in data field: ${error.message}`, { itemIndex: i });
                            }
                        }
                        // Build message object
                        if (multipleTokens) {
                            message = {
                                ...(messageType === 'notification' ? {
                                    notification: {
                                        title,
                                        body,
                                        ...(imageUrl && { imageUrl }),
                                        ...(sound && { sound }),
                                        ...(clickAction && { clickAction }),
                                    },
                                } : {}),
                                android: {
                                    ...(priority && { priority }),
                                },
                                apns: {
                                    payload: {
                                        aps: {
                                            ...(sound && { sound }),
                                            ...(priority === 'high' ? { 'content-available': 1 } : {}),
                                        },
                                    },
                                },
                                ...(data && { data }),
                                tokens,
                            }; // Using any to avoid type conflicts
                        }
                        else {
                            message = {
                                ...(messageType === 'notification' ? {
                                    notification: {
                                        title,
                                        body,
                                        ...(imageUrl && { imageUrl }),
                                        ...(sound && { sound }),
                                        ...(clickAction && { clickAction }),
                                    },
                                } : {}),
                                android: {
                                    ...(priority && { priority }),
                                },
                                apns: {
                                    payload: {
                                        aps: {
                                            ...(sound && { sound }),
                                            ...(priority === 'high' ? { 'content-available': 1 } : {}),
                                        },
                                    },
                                },
                                ...(data && { data }),
                                token,
                            }; // Using any to avoid type conflicts
                        }
                    }
                    // Validate token(s) if not using JSON parameters
                    if (!jsonParameters && message) {
                        if ('tokens' in message && Array.isArray(message.tokens)) {
                            const invalidTokens = message.tokens.filter((token) => !(0, validation_utils_1.validateToken)(token));
                            if (invalidTokens.length > 0) {
                                throw new Error(`Invalid FCM token format: ${invalidTokens.join(', ')}`);
                            }
                        }
                        else if ('token' in message && typeof message.token === 'string') {
                            if (!(0, validation_utils_1.validateToken)(message.token)) {
                                throw new Error(`Invalid FCM token format: ${message.token}`);
                            }
                        }
                    }
                    // Send the message
                    let result;
                    if ('tokens' in message) {
                        // Send multicast message
                        this.logger.debug(`Sending multicast message to ${(_a = message.tokens) === null || _a === void 0 ? void 0 : _a.length} tokens`);
                        result = await (0, firebase_utils_1.getMessaging)(firebaseApp).sendMulticast(message);
                    }
                    else {
                        // Send single message
                        this.logger.debug(`Sending message to token: ${message.token}`);
                        result = await (0, firebase_utils_1.getMessaging)(firebaseApp).send(message);
                    }
                    returnData.push({
                        json: {
                            success: true,
                            result,
                        },
                        pairedItem: { item: i },
                    });
                }
                else if (operation === 'sendToTopic') {
                    // Handle sending to topic
                    this.logger.debug('Executing sendToTopic operation');
                    let messagePayload;
                    if (jsonParameters) {
                        // Use JSON directly
                        const messageJson = this.getNodeParameter('messageJson', i);
                        messagePayload = JSON.parse(messageJson);
                    }
                    else {
                        // Build message from parameters
                        const topic = this.getNodeParameter('topic', i, '');
                        if (!topic) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Topic name is required', { itemIndex: i });
                        }
                        // Validate topic format
                        if (!(0, validation_utils_1.validateTopic)(topic)) {
                            throw new Error('Invalid topic format. Topics must match pattern [a-zA-Z0-9-_.~%]+');
                        }
                        // Ensure topic is properly formatted
                        const formattedTopic = topic.startsWith('/topics/') ? topic : `/topics/${topic}`;
                        // Get notification content
                        const messageFields = this.getNodeParameter('message.messageFields', i, {});
                        const title = messageFields.title;
                        const body = messageFields.body;
                        const imageUrl = messageFields.imageUrl;
                        const priority = messageFields.priority;
                        const sound = messageFields.sound;
                        const clickAction = messageFields.clickAction;
                        const dataJson = messageFields.data;
                        const messageType = this.getNodeParameter('messageType', i, 'notification');
                        // Parse data payload if provided
                        let data;
                        if (dataJson && dataJson !== '{}') {
                            try {
                                data = JSON.parse(dataJson);
                                // Ensure all values are strings as required by FCM
                                if (data) {
                                    Object.keys(data).forEach(key => {
                                        if (data && typeof data[key] !== 'string') {
                                            data[key] = String(data[key]);
                                        }
                                    });
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid JSON in data field: ${error.message}`, { itemIndex: i });
                            }
                        }
                        // Build message object
                        messagePayload = {
                            ...(messageType === 'notification' ? {
                                notification: {
                                    title,
                                    body,
                                    ...(imageUrl && { imageUrl }),
                                    ...(sound && { sound }),
                                    ...(clickAction && { clickAction }),
                                },
                            } : {}),
                            android: {
                                ...(priority && { priority }),
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        ...(sound && { sound }),
                                        ...(priority === 'high' ? { 'content-available': 1 } : {}),
                                    },
                                },
                            },
                            ...(data && { data }),
                            topic: formattedTopic.replace('/topics/', ''), // Firebase API doesn't want the /topics/ prefix
                        };
                    }
                    // Send the message
                    this.logger.debug(`Sending message to topic: ${messagePayload.topic}`);
                    const result = await (0, firebase_utils_1.getMessaging)(firebaseApp).send(messagePayload);
                    returnData.push({
                        json: {
                            success: true,
                            result,
                        },
                        pairedItem: { item: i },
                    });
                }
                else if (operation === 'sendToCondition') {
                    // Handle sending with condition
                    this.logger.debug('Executing sendToCondition operation');
                    let messagePayload;
                    if (jsonParameters) {
                        // Use JSON directly
                        const messageJson = this.getNodeParameter('messageJson', i);
                        messagePayload = JSON.parse(messageJson);
                    }
                    else {
                        // Build message from parameters
                        const condition = this.getNodeParameter('condition', i, '');
                        if (!condition) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Condition is required', { itemIndex: i });
                        }
                        // Validate condition format
                        if (!(0, validation_utils_1.validateCondition)(condition)) {
                            throw new Error('Invalid condition format. Must include "in topics" and logical operators (&&, ||)');
                        }
                        // Get notification content
                        const messageFields = this.getNodeParameter('message.messageFields', i, {});
                        const title = messageFields.title;
                        const body = messageFields.body;
                        const imageUrl = messageFields.imageUrl;
                        const priority = messageFields.priority;
                        const sound = messageFields.sound;
                        const clickAction = messageFields.clickAction;
                        const dataJson = messageFields.data;
                        const messageType = this.getNodeParameter('messageType', i, 'notification');
                        // Parse data payload if provided
                        let data;
                        if (dataJson && dataJson !== '{}') {
                            try {
                                data = JSON.parse(dataJson);
                                // Ensure all values are strings as required by FCM
                                if (data) {
                                    Object.keys(data).forEach(key => {
                                        if (data && typeof data[key] !== 'string') {
                                            data[key] = String(data[key]);
                                        }
                                    });
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid JSON in data field: ${error.message}`, { itemIndex: i });
                            }
                        }
                        // Build message object
                        messagePayload = {
                            ...(messageType === 'notification' ? {
                                notification: {
                                    title,
                                    body,
                                    ...(imageUrl && { imageUrl }),
                                    ...(sound && { sound }),
                                    ...(clickAction && { clickAction }),
                                },
                            } : {}),
                            android: {
                                ...(priority && { priority }),
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        ...(sound && { sound }),
                                        ...(priority === 'high' ? { 'content-available': 1 } : {}),
                                    },
                                },
                            },
                            ...(data && { data }),
                            condition,
                        };
                    }
                    // Send the message
                    this.logger.debug(`Sending message with condition: ${messagePayload.condition}`);
                    const result = await (0, firebase_utils_1.getMessaging)(firebaseApp).send(messagePayload);
                    returnData.push({
                        json: {
                            success: true,
                            result,
                        },
                        pairedItem: { item: i },
                    });
                }
                else if (operation === 'subscribeToTopic') {
                    // Handle subscribing to topic
                    this.logger.debug('Executing subscribeToTopic operation');
                    const topic = this.getNodeParameter('topic', i, '');
                    const registrationTokens = this.getNodeParameter('registrationTokens', i, []);
                    if (!topic) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Topic name is required', { itemIndex: i });
                    }
                    if (registrationTokens.length === 0) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one registration token is required', { itemIndex: i });
                    }
                    if (registrationTokens.length > 1000) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Maximum of 1000 tokens allowed in a single subscribe request', { itemIndex: i });
                    }
                    // Ensure topic is properly formatted - without /topics/ prefix as the API doesn't want it
                    const formattedTopic = topic.replace(/^\/topics\//, '');
                    // Subscribe tokens to topic
                    this.logger.debug(`Subscribing ${registrationTokens.length} tokens to topic: ${formattedTopic}`);
                    const result = await (0, firebase_utils_1.getMessaging)(firebaseApp).subscribeToTopic(registrationTokens, formattedTopic);
                    returnData.push({
                        json: {
                            success: true,
                            result,
                        },
                        pairedItem: { item: i },
                    });
                }
                else if (operation === 'unsubscribeFromTopic') {
                    // Handle unsubscribing from topic
                    this.logger.debug('Executing unsubscribeFromTopic operation');
                    const topic = this.getNodeParameter('topic', i, '');
                    const registrationTokens = this.getNodeParameter('registrationTokens', i, []);
                    if (!topic) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Topic name is required', { itemIndex: i });
                    }
                    if (registrationTokens.length === 0) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one registration token is required', { itemIndex: i });
                    }
                    if (registrationTokens.length > 1000) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Maximum of 1000 tokens allowed in a single unsubscribe request', { itemIndex: i });
                    }
                    // Ensure topic is properly formatted - without /topics/ prefix as the API doesn't want it
                    const formattedTopic = topic.replace(/^\/topics\//, '');
                    // Unsubscribe tokens from topic
                    this.logger.debug(`Unsubscribing ${registrationTokens.length} tokens from topic: ${formattedTopic}`);
                    const result = await (0, firebase_utils_1.getMessaging)(firebaseApp).unsubscribeFromTopic(registrationTokens, formattedTopic);
                    returnData.push({
                        json: {
                            success: true,
                            result,
                        },
                        pairedItem: { item: i },
                    });
                }
                else {
                    // For now, other operations are not implemented
                    this.logger.debug(`Operation ${operation} selected, but not yet implemented fully`);
                    returnData.push({
                        json: {
                            success: false,
                            message: `Operation ${operation} not fully implemented yet`,
                        },
                        pairedItem: { item: i },
                    });
                }
            }
            return [returnData];
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Firebase Cloud Messaging operation failed: ${error.message}`, { itemIndex: 0 });
        }
    }
}
exports.FirebaseCloudMessage = FirebaseCloudMessage;
//# sourceMappingURL=FirebaseCloudMessage.node.js.map