# Agente de Atendimento com Inteligência Artificial

Sistema de atendimento ao cliente desenvolvido com **Node.js, TypeScript, Express, Google Gemini e LangChain**, integrando inteligência artificial generativa a funcionalidades de consulta de pedidos, consulta de produtos e solicitação de cancelamento.

O projeto foi desenvolvido como parte de um desafio técnico, com foco em integração de LLMs, APIs REST, regras de negócio, testes automatizados, observabilidade, conteinerização e segurança na execução de operações sensíveis.

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
- **Docker e Docker Compose** — empacotamento e execução da aplicação em contêineres.

## Funcionalidades

- Atendimento conversacional com IA generativa.
- Consulta de informações e status de pedidos.
- Consulta de produtos por meio de integração com a Fake Store API.
- Solicitação de cancelamento de pedidos.
- Confirmação explícita antes de executar cancelamentos.
- Validação de regras de negócio no backend.
- Tratamento de erros e limites de execução do agente.
- Encaminhamento para atendimento humano em situações não suportadas.
- Interface web integrada à API.
- Documentação interativa com Swagger.
- Logs estruturados de requisições e operações.
- Testes automatizados de serviços, ferramentas e endpoints.
- Execução local com Node.js ou Docker Compose.

## Arquitetura

O sistema utiliza uma arquitetura que separa a interface, as rotas HTTP, a lógica do agente e os serviços responsáveis pelas operações de negócio.

### Fluxo simplificado

1. O cliente envia uma mensagem pela interface web.
2. A API recebe e valida a requisição.
3. O agente utiliza o Gemini para interpretar a solicitação.
4. Quando necessário, o agente solicita a execução de ferramentas.
5. O backend valida as regras de negócio e executa as operações permitidas.
6. O resultado é apresentado ao cliente.

### Integração com ferramentas

O agente utiliza chamadas de ferramentas para consultar informações e solicitar operações ao backend.

A execução dessas ferramentas é controlada pela aplicação, permitindo que as regras de negócio sejam verificadas independentemente da resposta gerada pelo modelo.

### Segurança no cancelamento

O cancelamento de pedidos exige confirmação explícita do cliente.

O modelo de IA não possui autorização para executar diretamente o cancelamento. A operação é controlada pelo backend, que verifica as condições necessárias antes de realizá-la.

Entre as regras implementadas estão:

- Verificação da existência do pedido.
- Validação das condições para cancelamento.
- Impedimento do cancelamento de pedidos enviados.
- Exigência de confirmação explícita.
- Comunicação de sucesso somente após confirmação da API.
- Tratamento de falhas sem afirmar que uma operação foi concluída.

## Como executar o projeto

O projeto pode ser executado localmente com Node.js ou por meio do Docker Compose.

### Opção 1 — Execução local com Node.js

#### Pré-requisitos

- Node.js e npm instalados.
- Uma chave de API válida do Google Gemini.

#### 1. Clonar o repositório

```bash
git clone https://github.com/mayararoseno1/agente-atendimento-ia.git
cd agente-atendimento-ia
git switch develop
```

#### 2. Instalar as dependências

```bash
npm install
```

#### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, utilizando `.env.example` como referência:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Não publique sua chave de API no GitHub.

#### 4. Iniciar a aplicação

Para executar em ambiente de desenvolvimento:

```bash
npm run dev
```

Por padrão, a aplicação utiliza a porta `3000`.

#### 5. Acessar a aplicação

- **Interface web:** http://localhost:3000
- **Documentação Swagger:** http://localhost:3000/api-docs
- **Health check:** http://localhost:3000/health

### Opção 2 — Execução com Docker Compose

O projeto possui suporte a Docker e Docker Compose, permitindo executar a aplicação sem instalar Node.js diretamente no computador.

#### Pré-requisitos

- Docker Desktop ou Docker Engine com Docker Compose.
- Uma chave de API válida do Google Gemini.

#### 1. Clonar o repositório

```bash
git clone https://github.com/mayararoseno1/agente-atendimento-ia.git
cd agente-atendimento-ia
git switch develop
```

#### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, utilizando `.env.example` como referência.

Adicione:

```env
GEMINI_API_KEY=sua_chave_aqui
```

O arquivo `.env` é ignorado pelo Git e excluído do contexto de construção da imagem Docker.

A chave é fornecida ao contêiner durante sua execução, sem ser incorporada à imagem.

#### 3. Construir e iniciar a aplicação

Execute:

```bash
docker compose up --build
```

O Docker Compose realizará a construção da imagem e iniciará o contêiner da aplicação.

#### 4. Acessar a aplicação

- **Interface web:** http://localhost:3001
- **Documentação Swagger:** http://localhost:3001/api-docs
- **Health check:** http://localhost:3001/health

A porta `3001` do computador é mapeada para a porta `3000` do contêiner.

#### 5. Encerrar a aplicação

Pressione `Ctrl + C` no terminal e execute:

```bash
docker compose down
```

#### Características da configuração Docker

- Utilização de imagem Node.js 24 Alpine.
- Construção multi-stage para separar compilação e execução.
- Compilação do TypeScript para JavaScript.
- Instalação apenas das dependências de produção na imagem final.
- Inclusão dos arquivos estáticos da interface web.
- Execução com usuário não privilegiado.
- Configuração de variáveis de ambiente em tempo de execução.
- Exclusão de arquivos sensíveis por meio do `.dockerignore`.

**Observação:** os pedidos e as confirmações temporárias são mantidos em memória. Seus estados não persistem após a recriação ou reinicialização do processo da aplicação.

## API REST

O projeto disponibiliza os seguintes endpoints:

| Recurso | Rota |
|---|---|
| Verificação de saúde | `GET /health` |
| Atendimento com IA | `POST /chat` |
| Consulta de pedidos | `GET /orders/:id` |
| Consulta de produtos | `GET /products/:id` |
| Solicitação de cancelamento | `POST /orders/:id/cancellation-request` |
| Confirmação e execução de cancelamento | `POST /orders/:id/cancel` |

Os detalhes dos parâmetros, corpos de requisição e respostas podem ser consultados na documentação Swagger.

### Exemplo de interação com o agente

**Mensagem do cliente:**

> Olá! Qual é o status do pedido ORD-001?

**Exemplo de resposta:**

> O pedido ORD-001 está atualmente com o status "processing" (em processamento).

Nesse fluxo, o Gemini identifica a necessidade de consultar o pedido, solicita a execução da ferramenta correspondente e utiliza o resultado para elaborar a resposta.

## Testes automatizados

Para executar os testes:

```bash
npm test
```

Na última validação da branch `develop`, o projeto apresentou:

**69 testes aprovados em 11 arquivos de teste.**

Os testes abrangem:

- Serviços e regras de negócio.
- Endpoints HTTP.
- Ferramentas utilizadas pelo agente.
- Confirmação de cancelamento.
- Validação de entradas.
- Tratamento de falhas.
- Comportamentos de segurança.

Os testes automatizados utilizam simulações das respostas do modelo quando necessário, permitindo validar a lógica da aplicação sem depender continuamente da API externa.

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

### Exemplo de log estruturado

```json
{
  "level": 30,
  "req": {
    "method": "POST",
    "url": "/chat"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 2086,
  "msg": "request completed"
}
```

Os logs HTTP registram informações operacionais sem incluir automaticamente o corpo completo das mensagens ou a chave de API.

Também existem registros do fluxo de execução do agente, incluindo chamadas ao Gemini e identificação das ferramentas solicitadas.

## Segurança e tratamento de falhas

O projeto adota medidas de proteção para operações sensíveis e integração com modelos de linguagem.

Entre elas:

- Separação entre decisões do modelo e regras de negócio.
- Validação de dados recebidos pela API.
- Confirmação explícita para operações de cancelamento.
- Limitação das rodadas de execução de ferramentas.
- Controle de tempo de processamento do agente.
- Tratamento de falhas nas integrações externas.
- Orientações para não confiar em instruções provenientes de dados externos.
- Respostas de contingência quando não é possível concluir uma solicitação.
- Proteção de variáveis sensíveis por meio de arquivos de ambiente.

Essas medidas reduzem riscos, mas não substituem mecanismos completos de autenticação, autorização e auditoria exigidos em ambientes de produção.

## Limitações e considerações

O projeto é uma implementação demonstrativa desenvolvida para avaliação técnica.

As principais limitações são:

- **Persistência:** pedidos e confirmações são mantidos em memória.
- **Autenticação:** o identificador do cliente é demonstrativo e não representa uma autenticação real.
- **Integrações externas:** a disponibilidade do Gemini e da Fake Store API depende de serviços externos.
- **Mensageria:** o atendimento é simulado por uma interface web, sem integração com uma plataforma real de mensagens.
- **Escalabilidade:** o armazenamento em memória não é adequado para múltiplas instâncias independentes.
- **Segurança em produção:** seriam necessários controles adicionais de autenticação, autorização, auditoria e proteção contra abuso.

Para uso em produção, também seriam recomendados mecanismos de persistência, monitoramento, gerenciamento de segredos e infraestrutura apropriada.

## Repositório

https://github.com/mayararoseno1/agente-atendimento-ia
