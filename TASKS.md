# TASKS for @jaimeflneto/n8n-nodes-firebase-cloud-message

## 1. Setup & Structure

* [ ] Criar estrutura inicial do projeto custom node para n8n
* [ ] Configurar package.json com nome: `@jaimeflneto/n8n-nodes-firebase-cloud-message`
* [ ] Adicionar estrutura de build (TypeScript + n8n Node Dev Tools)
* [ ] Adicionar README inicial com propósito do nó

## 2. Autenticação

* [ ] Implementar suporte a autenticação via OAuth 2.0 com chave JSON (Conta de Serviço do Google)
* [ ] Validar escopos e token JWT necessário para acessar FCM
* [ ] Testar autenticação usando chave JSON local

## 3. Interface do Nó

* [ ] Criar campo para inserir token de dispositivo (string ou array de strings)
* [ ] Adicionar campo de seleção entre modo JSON bruto e modo campos individuais
* [ ] Campos individuais incluem: título, corpo, ícone, som, action
* [ ] Adicionar opções de envio para:

  * [ ] Token único ou múltiplos tokens
  * [ ] Tópico (`/topics/...`)
  * [ ] Grupo com condição (`/condition/...`)

## 4. Lógica de Envio

* [ ] Implementar função de envio de mensagem para o endpoint FCM
* [ ] Montar payload com base na escolha (JSON bruto vs campos estruturados)
* [ ] Validar tipo de destino (token, tópico, grupo)
* [ ] Implementar tratamento de erros da API do Firebase

## 5. Recursos Adicionais (Bonus)

* [ ] Adicionar suporte a campos extras como prioridade, som personalizado
* [ ] Suporte preliminar a In-App Messaging (se possível via FCM)

## 6. Testes e Qualidade

* [ ] Criar exemplos de uso no README
* [ ] Testar com diferentes tipos de envio (token, tópico, grupo)
* [ ] Testar com campos individuais e com JSON
* [ ] Adicionar validação básica nos inputs do nó

## 7. Publicação

* [ ] Preparar e publicar o pacote npm
* [ ] Criar instruções de instalação para a comunidade n8n
* [ ] Compartilhar repositório no GitHub com MIT License
