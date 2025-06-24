# TASKS for @jaimeflneto/n8n-nodes-firebase-cloud-message

## 1. Setup & Structure

* [x] Criar estrutura inicial do projeto custom node para n8n
* [x] Configurar package.json com nome: `@jaimeflneto/n8n-nodes-firebase-cloud-message`
* [x] Adicionar estrutura de build (TypeScript + n8n Node Dev Tools)
* [x] Adicionar README inicial com propósito do nó

## 2. Autenticação

* [x] Implementar suporte a autenticação via OAuth 2.0 com chave JSON (Conta de Serviço do Google)
* [x] Validar escopos e token JWT necessário para acessar FCM
* [x] Testar autenticação usando chave JSON local

## 3. Interface do Nó

* [x] Criar campo para inserir token de dispositivo (string ou array de strings)
* [x] Adicionar campo de seleção entre modo JSON bruto e modo campos individuais
* [x] Campos individuais incluem: título, corpo, ícone, som, action
* [x] Adicionar opções de envio: para token, para tópico, para condição

## 4. Operações do FCM

* [x] Implementar envio de mensagem para token único
* [x] Implementar envio de mensagem para múltiplos tokens (multicast)
* [x] Implementar envio de mensagem para tópico
* [x] Implementar envio de mensagem baseado em condição
* [x] Implementar inscrição de tokens em tópicos
* [x] Implementar remoção de tokens de tópicos

## 5. Recursos Adicionais (Bonus)

* [x] Adicionar suporte para prioridade de mensagem (alta/normal)
* [x] Adicionar suporte para som personalizado
* [x] Adicionar suporte para clickAction (URL ou intent)
* [x] Adicionar suporte para envio de dados personalizados (data payload)
* [x] Adicionar suporte para envio de mensagem somente com dados (sem notificação)

## 6. Testes e Qualidade

* [x] Testar envio para token único
* [x] Testar envio para múltiplos tokens
* [x] Testar envio para tópico
* [x] Testar envio com condição
* [x] Testar inscrição em tópico
* [x] Testar modo JSON e modo campos individuais
* [x] Verificar tratamento de erros e validações

## 7. Documentação

* [x] Adicionar README completo com instruções de instalação
* [x] Documentar parâmetros de autenticação
* [x] Documentar operações disponíveis
* [x] Adicionar exemplos de uso
* [x] Adicionar licença MIT
