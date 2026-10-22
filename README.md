# Agente de Atendimento com Inteligência Artificial

Sistema de atendimento ao cliente desenvolvido com **Node.js, TypeScript, Express, Google Gemini e LangChain**, integrando inteligência artificial generativa a funcionalidades de consulta de pedidos, consulta de produtos e solicitação de cancelamento.

O projeto foi desenvolvido como parte de um desafio técnico, com foco em integração de LLMs, APIs REST, regras de negócio, testes automatizados e segurança na execução de operações sensíveis.

## Tecnologias utilizadas

- **Node.js e TypeScript** — desenvolvimento do backend.
- **Express** — construção das APIs REST.
- **Google Gemini** — processamento de linguagem natural.
- **LangChain** — integração e orquestração do agente de IA.
- **Zod** — definição e validação de estruturas de dados.
- **Vitest e Supertest** — testes automatizados.
- **Swagger/OpenAPI** — documentação interativa da API.
- **Pino** — logs estruturados.
- **HTML, CSS e JavaScript** — interface web de atendimento.

## Funcionalidades

- Atendimento conversacional com IA generativa.
- Consulta de informações de pedidos.
- Consulta de produtos.
- Solicitação de cancelamento de pedidos.
- Confirmação explícita antes de executar cancelamentos.
- Validação de regras de negócio no backend.
- Tratamento de erros e limites de execução do agente.
- Interface web integrada à API.
- Documentação interativa com Swagger.
- Testes automatizados de serviços, ferramentas e endpoints.

## Arquitetura

O sistema utiliza uma arquitetura que separa a interface, as rotas HTTP, a lógica do agente e os serviços responsáveis pelas operações de negócio.

**Fluxo simplificado:**

1. O cliente envia uma mensagem pela interface web.
2. A API recebe e valida a requisição.
3. O agente utiliza o Gemini para interpretar a solicitação.
4. Quando necessário, o agente solicita a execução de ferramentas.
5. O backend valida as regras de negócio e executa as operações permitidas.
6. O resultado é apresentado ao cliente.

### Segurança no cancelamento

O cancelamento de pedidos exige confirmação explícita do cliente.

O modelo de IA não possui autorização para executar diretamente o cancelamento. A operação é controlada pelo backend, que verifica as condições necessárias antes de realizá-la.

## Como executar o projeto

### Pré-requisitos

- Node.js e npm instalados.
- Uma chave de API válida do Google Gemini.

### 1. Clonar o repositório

```bash
git clone https://github.com/mayararoseno1/agente-atendimento-ia.git
cd agente-atendimento-ia
git switch develop
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, utilizando `.env.example` como referência:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Não publique sua chave de API no GitHub.

### 4. Iniciar a aplicação

Para executar em ambiente de desenvolvimento:

```bash
npm run dev
```

Por padrão, a aplicação utiliza a porta `3000`.

### 5. Acessar a aplicação

**Interface web:**

http://localhost:3000

**Documentação Swagger:**

http://localhost:3000/api-docs

**Health check:**

http://localhost:3000/health

## API REST

O projeto disponibiliza endpoints para:

| Recurso | Rota |
|---|---|
| Verificação de saúde | `GET /health` |
| Atendimento com IA | `POST /chat` |
| Consulta de pedidos | `GET /orders/:id` |
| Consulta de produtos | `GET /products/:id` |
| Solicitação de cancelamento | `POST /orders/:id/cancellation-request` |
| Confirmação e execução de cancelamento | `POST /orders/:id/cancel` |

Os detalhes dos parâmetros, corpos de requisição e respostas devem ser consultados na documentação Swagger e nas implementações das rotas.

## Testes automatizados

Para executar os testes:

```bash
npm test
```

Na última validação da branch `develop`, o projeto apresentou:

**69 testes aprovados em 11 arquivos de teste.**

Os testes abrangem serviços, endpoints, ferramentas do agente, confirmação de cancelamento e tratamento de falhas.

## Build e execução

Para compilar o projeto TypeScript:

```bash
npm run build
```

Para iniciar a versão compilada:

```bash
npm start
```

## Observabilidade

A aplicação utiliza Pino para geração de logs estruturados, incluindo registros de requisições HTTP e eventos relacionados às operações de negócio.

## Limitações e considerações

O projeto é uma implementação demonstrativa desenvolvida para avaliação técnica.

O fluxo atual utiliza dados de demonstração e controle temporário de confirmações de cancelamento. Para uso em produção, seriam necessárias melhorias como autenticação robusta de clientes, persistência das solicitações, controle de acesso e infraestrutura apropriada.

## Repositório

https://github.com/mayararoseno1/agente-atendimento-ia