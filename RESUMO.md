# Resumo do Projeto n8n-nodes-firebase-cloud-message

## Visão Geral

Este projeto implementa um nó personalizado para a plataforma n8n que permite enviar notificações push via Firebase Cloud Messaging (FCM). O nó oferece uma interface amigável para configurar e enviar diferentes tipos de mensagens para dispositivos móveis.

## Funcionalidades Implementadas

### 1. Autenticação Firebase
- Autenticação via Conta de Serviço do Google (arquivo JSON)
- Validação de credenciais e campos obrigatórios
- Configurações opcionais (URL do banco de dados, bucket de armazenamento, região)

### 2. Operações de Mensagem
- Envio para token único
- Envio para múltiplos tokens (multicast)
- Envio para tópico
- Envio baseado em condição
- Inscrição de tokens em tópicos
- Cancelamento de inscrição de tokens em tópicos

### 3. Tipos de Mensagem
- Notificações com campos personalizáveis:
  - Título e corpo
  - URL de imagem
  - Prioridade (normal/alta)
  - Som personalizado
  - Ação de clique
- Mensagens somente com dados (sem notificação)
- Suporte para dados personalizados (payload JSON)

### 4. Configuração Flexível
- Modo JSON para configuração manual completa
- Modo de campos estruturados para configuração simplificada
- Validação de parâmetros e tratamento de erros

## Estrutura do Projeto

```
n8n-nodes-firebase-cloud-message/
├── dist/                      # Código compilado
├── src/
│   ├── credentials/           # Configuração de credenciais
│   │   └── FirebaseCloudMessageApi.credentials.ts
│   ├── nodes/
│   │   └── FirebaseCloudMessage/
│   │       ├── FirebaseCloudMessage.node.ts  # Implementação do nó
│   │       └── icons/                        # Ícones do nó
│   └── index.ts               # Ponto de entrada
├── package.json               # Configuração do pacote
├── tsconfig.json              # Configuração do TypeScript
├── README.md                  # Documentação
└── LICENSE                    # Licença MIT
```

## Tecnologias Utilizadas

- TypeScript
- n8n Node Development Tools
- Firebase Admin SDK
- JSON Web Tokens (JWT)

## Próximos Passos

- Publicação no registro npm
- Compartilhamento com a comunidade n8n
- Possíveis melhorias:
  - Suporte para In-App Messaging
  - Agendamento de mensagens
  - Análise de entrega e engajamento 