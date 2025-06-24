# n8n-nodes-firebase-cloud-message

Este é um nó comunitário n8n que permite enviar notificações push via Firebase Cloud Messaging (FCM).

[n8n](https://n8n.io/) é uma plataforma de automação de fluxo de trabalho com [licença fair-code](https://docs.n8n.io/reference/license/).

[Instalação](#instalação) | [Installation](#installation)  
[Operações](#operações) | [Operations](#operations)  
[Credenciais](#credenciais) | [Credentials](#credentials)  
[Recursos](#recursos) | [Resources](#resources)  

## Instalação

Siga o [guia de instalação](https://docs.n8n.io/integrations/community-nodes/installation/) na documentação de nós comunitários n8n.

### Instalação Rápida

Instale a partir da aba Community Nodes do n8n:

1. No painel do n8n, navegue até **Configurações > Nós Comunitários**
2. Selecione **Instalar**
3. Digite `n8n-nodes-firebase-cloud-message` em **Digite o nome do pacote npm**
4. Clique em **Instalar**

Ou via npm:

```bash
npm install n8n-nodes-firebase-cloud-message
```

Para instalação global:

```bash
npm install -g n8n-nodes-firebase-cloud-message
```

## Operações

### Enviar para Token

Envie notificações para um dispositivo específico ou para múltiplos dispositivos usando tokens FCM.

**Opções:**
- Token único ou múltiplos tokens (até 500)
- Modo JSON para configuração manual completa
- Campos estruturados para configuração simples

### Enviar para Tópico

Envie notificações para todos os dispositivos inscritos em um tópico específico.

**Opções:**
- Nome do tópico (com ou sem prefixo `/topics/`)
- Modo JSON para configuração manual completa
- Campos estruturados para configuração simples

### Enviar para Condição

Envie notificações para dispositivos que atendam a uma condição específica (combinação de tópicos).

**Opções:**
- Condição (ex: `'TopicA' in topics && ('TopicB' in topics || 'TopicC' in topics)`)
- Modo JSON para configuração manual completa
- Campos estruturados para configuração simples

### Inscrever em Tópico

Inscreva tokens de dispositivo em um tópico específico.

**Opções:**
- Nome do tópico
- Lista de tokens de dispositivo (até 1000)

### Cancelar Inscrição em Tópico

Cancele a inscrição de tokens de dispositivo de um tópico específico.

**Opções:**
- Nome do tópico
- Lista de tokens de dispositivo (até 1000)

## Tipos de Mensagem

### Notificação com Dados Opcionais

Envie uma notificação que aparece no dispositivo com um payload de dados opcional.

**Campos de Notificação:**
- Título
- Corpo
- URL da Imagem
- Prioridade (Normal/Alta)
- Som Personalizado
- Ação de Clique (URL ou Intent)
- Dados (payload JSON personalizado)

### Somente Dados

Envie apenas uma mensagem de dados que é tratada pelo aplicativo e não aparece como uma notificação.

**Campos:**
- Dados (payload JSON personalizado)
- Prioridade (Normal/Alta)

## Credenciais

### Conta de Serviço do Firebase

Para usar este nó, você precisa de uma conta de serviço do Firebase:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para Configurações do Projeto > Contas de serviço
4. Clique em "Gerar nova chave privada"
5. Baixe o arquivo JSON da conta de serviço

**Campos de Credencial:**
- Conteúdo JSON da Conta de Serviço
- URL do Banco de Dados (opcional)
- Bucket de Armazenamento (opcional)
- Região (opcional)

## Recursos

- [Documentação do Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Documentação n8n](https://docs.n8n.io/)

## Exemplos de Uso

### Enviar Notificação para um Dispositivo

```json
{
  "notification": {
    "title": "Título da Notificação",
    "body": "Corpo da mensagem de notificação"
  },
  "token": "DEVICE_TOKEN_HERE"
}
```

### Enviar Notificação para um Tópico

```json
{
  "notification": {
    "title": "Título da Notificação",
    "body": "Corpo da mensagem de notificação"
  },
  "topic": "noticias"
}
```

### Enviar Mensagem de Dados para Múltiplos Dispositivos

```json
{
  "data": {
    "tipo": "atualização",
    "valor": "123",
    "ação": "abrir_tela"
  },
  "tokens": ["TOKEN1", "TOKEN2", "TOKEN3"]
}
```

## Tratamento de Erros

O nó inclui tratamento abrangente de erros para problemas comuns do Firebase Cloud Messaging:

- Tokens de registro inválidos ou expirados
- Erros de autenticação
- Limitações de tamanho da carga
- Problemas de conectividade
- Validação de entrada

Quando o modo "Continue em caso de falha" está ativado, o nó retornará informações detalhadas sobre o erro em vez de interromper o fluxo de trabalho.

---

# English Documentation

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Installation

Install from the n8n Community Nodes tab:

1. In the n8n panel, navigate to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-firebase-cloud-message` in **Enter npm package name**
4. Click **Install**

Or via npm:

```bash
npm install n8n-nodes-firebase-cloud-message
```

For global installation:

```bash
npm install -g n8n-nodes-firebase-cloud-message
```

## Operations

### Send to Token

Send notifications to a specific device or multiple devices using FCM tokens.

**Options:**
- Single token or multiple tokens (up to 500)
- JSON mode for complete manual configuration
- Structured fields for simple configuration

### Send to Topic

Send notifications to all devices subscribed to a specific topic.

**Options:**
- Topic name (with or without `/topics/` prefix)
- JSON mode for complete manual configuration
- Structured fields for simple configuration

### Send to Condition

Send notifications to devices that meet a specific condition (combination of topics).

**Options:**
- Condition (e.g., `'TopicA' in topics && ('TopicB' in topics || 'TopicC' in topics)`)
- JSON mode for complete manual configuration
- Structured fields for simple configuration

### Subscribe to Topic

Subscribe device tokens to a specific topic.

**Options:**
- Topic name
- List of device tokens (up to 1000)

### Unsubscribe from Topic

Unsubscribe device tokens from a specific topic.

**Options:**
- Topic name
- List of device tokens (up to 1000)

## Message Types

### Notification with Optional Data

Send a notification that appears on the device with an optional data payload.

**Notification Fields:**
- Title
- Body
- Image URL
- Priority (Normal/High)
- Custom Sound
- Click Action (URL or Intent)
- Data (custom JSON payload)

### Data Only

Send only a data message that is handled by the app and does not appear as a notification.

**Fields:**
- Data (custom JSON payload)
- Priority (Normal/High)

## Credentials

### Firebase Service Account

To use this node, you need a Firebase service account:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service accounts
4. Click "Generate new private key"
5. Download the service account JSON file

**Credential Fields:**
- Service Account JSON Content
- Database URL (optional)
- Storage Bucket (optional)
- Region (optional)

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [n8n Documentation](https://docs.n8n.io/)

## Usage Examples

### Send Notification to a Device

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification message body"
  },
  "token": "DEVICE_TOKEN_HERE"
}
```

### Send Notification to a Topic

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification message body"
  },
  "topic": "news"
}
```

### Send Data Message to Multiple Devices

```json
{
  "data": {
    "type": "update",
    "value": "123",
    "action": "open_screen"
  },
  "tokens": ["TOKEN1", "TOKEN2", "TOKEN3"]
}
```

## Error Handling

The node includes comprehensive error handling for common Firebase Cloud Messaging issues:

- Invalid or expired registration tokens
- Authentication errors
- Payload size limitations
- Connectivity issues
- Input validation

When "Continue on Fail" mode is enabled, the node will return detailed error information instead of stopping the workflow.

## License

[MIT](LICENSE) 