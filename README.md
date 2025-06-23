# n8n-nodes-firebase-cloud-message

This is an n8n community node that enables sending push notifications through Firebase Cloud Messaging (FCM).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Node Reference](#node-reference)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install n8n-nodes-firebase-cloud-message
```

## Operations

- **Send to Token**: Send a notification to a specific device token
- **Send to Topic**: Send a notification to devices subscribed to a specific topic
- **Send to Condition**: Send a notification to devices that match a specific condition

## Credentials

To use this node, you need Firebase Cloud Messaging credentials. These can be obtained by creating a Firebase project and setting up Firebase Cloud Messaging.

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Project Settings > Service accounts
4. Click on "Generate new private key" to download the JSON service account key
5. Use this JSON as your credential for the node

## Node Reference

- **Message Target**: Specify how you want to target your notification (token, topic, condition)
- **Message Configuration**: Configure the notification payload, including title, body, and data

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Firebase Cloud Messaging documentation](https://firebase.google.com/docs/cloud-messaging) 