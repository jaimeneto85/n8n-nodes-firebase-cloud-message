# n8n-nodes-firebase-cloud-message

Este é um nó comunitário n8n que permite enviar notificações push via Firebase Cloud Messaging (FCM).

[n8n](https://n8n.io/) é uma plataforma de automação de fluxo de trabalho com [licença fair-code](https://docs.n8n.io/reference/license/).

[Instalação](#instalação)  
[Operações](#operações)  
[Credenciais](#credenciais)  
[Recursos](#recursos)  

## Instalação

Siga o [guia de instalação](https://docs.n8n.io/integrations/community-nodes/installation/) na documentação de nós comunitários n8n.

### Instalação Rápida

Instale a partir da aba Community Nodes do n8n, ou:

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

## Licença

[MIT](LICENSE) 