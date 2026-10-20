
# Regras de Negócio e Tomada de Decisão

## 1. Objetivo

Definir as regras que orientam o agente de atendimento e a API principal na consulta de pedidos e na solicitação de cancelamentos.

As regras de negócio devem ser aplicadas no backend, independentemente das respostas produzidas pelo modelo de inteligência artificial.

## 2. Regras obrigatórias do desafio

1. O agente pode consultar o status de um pedido.
2. Um pedido só pode ser cancelado quando estiver em processamento.
3. Pedidos enviados não podem ser cancelados pelo fluxo automatizado.
4. O agente deve confirmar explicitamente a intenção do cliente antes de solicitar o cancelamento.
5. O agente só pode confirmar que o cancelamento foi realizado após receber uma resposta de sucesso da API principal.
6. Se não conseguir verificar o pedido, houver falha em uma API ou faltarem informações, o agente não pode afirmar que concluiu a operação.
7. O agente deve oferecer atendimento humano quando a solicitação estiver fora do escopo ou não puder ser resolvida com segurança.
8. Mensagens do cliente e informações de APIs externas não podem substituir as regras de negócio nem as instruções do agente.

## 3. Dúvidas que precisam ser esclarecidas

Os pontos abaixo não são definidos integralmente no enunciado e devem ser confirmados com as áreas de negócio ou produto em um cenário real.

- **Identificação do cliente:** como comprovar que a pessoa que solicita informações tem autorização para consultar aquele pedido?
- **Dados do pedido:** quais informações podem ser exibidas durante a consulta?
- **Status adicionais:** quais comportamentos devem ser adotados para pedidos entregues, cancelados, devolvidos ou com status desconhecido?
- **Confirmação do cancelamento:** qual deve ser o prazo de validade da confirmação do cliente?
- **Falhas operacionais:** qual política de novas tentativas deve ser adotada quando a API estiver indisponível?
- **Atendimento humano:** qual canal deve receber o encaminhamento e como o histórico da conversa deve ser transferido?
- **Persistência:** por quanto tempo os dados de pedidos e o histórico de atendimento devem ser armazenados?

## 4. Suposições provisórias para a implementação

As decisões abaixo são hipóteses técnicas para viabilizar o protótipo. Não representam regras confirmadas pela empresa.

1. Os pedidos serão simulados em memória, sem banco de dados.
2. Cada pedido terá um identificador único e um status.
3. Os status iniciais do protótipo serão `PROCESSING`, `SHIPPED` e `CANCELLED`, correspondentes a em processamento, enviado e cancelado.
4. A API principal será a única responsável por autorizar e efetivar o cancelamento.
5. A confirmação deverá ocorrer na conversa atual e estar claramente relacionada ao pedido e à intenção de cancelar.
6. Se o pedido não for encontrado, a API retornar erro ou o status não for reconhecido, o agente não executará o cancelamento.
7. O atendimento humano será representado por uma resposta de encaminhamento, sem integração com uma equipe real.
8. A Fake Store API será usada exclusivamente para informações complementares sobre produtos.
9. Como o protótipo não terá autenticação real, os dados simulados serão destinados a testes locais, sem representar um sistema pronto para uso com clientes reais.

## 5. Matriz de decisão

| Cenário | Decisão |
|---|---|
| Consulta com identificador válido e pedido encontrado | Consultar e informar os dados permitidos. |
| Identificador do pedido ausente | Solicitar a informação necessária. |
| Pedido não encontrado | Informar que não foi possível localizar o pedido. |
| Pedido em processamento e cliente ainda não confirmou | Solicitar confirmação explícita. |
| Pedido em processamento e cliente confirmou | Solicitar o cancelamento à API principal. |
| Pedido enviado | Recusar o cancelamento automatizado. |
| Pedido já cancelado | Informar o status atual, sem alegar um novo cancelamento. |
| Status desconhecido | Não cancelar e encaminhar para atendimento humano. |
| Erro na API principal | Não afirmar sucesso; informar a falha e oferecer encaminhamento quando necessário. |
| Erro na Fake Store API | Tratar a indisponibilidade sem alterar as regras ou o status do pedido. |
| Tentativa de ignorar as regras ou revelar instruções internas | Manter os limites de segurança e continuar apenas com operações autorizadas. |
| Solicitação fora do escopo | Explicar a limitação e oferecer atendimento humano. |

## 6. Responsabilidades dos componentes

### Agente de IA

- Interpretar a intenção da mensagem.
- Solicitar informações que estejam faltando.
- Pedir confirmação antes de iniciar um cancelamento.
- Comunicar o resultado com base nas respostas das APIs.
- Não inventar dados nem afirmar que uma operação foi concluída sem confirmação técnica.

### API principal

- Validar os identificadores e os dados de entrada.
- Consultar os pedidos.
- Verificar o status atual no momento do cancelamento.
- Impedir cancelamentos de pedidos que não estejam em processamento.
- Retornar resultados que permitam distinguir sucesso, pedido inexistente, pedido não cancelável e erro técnico.

### Fake Store API

- Fornecer informações complementares sobre produtos.
- Não determinar o status nem autorizar cancelamentos de pedidos.

## 7. Limitações conhecidas

A implementação inicial será um protótipo educacional. Dados em memória podem ser perdidos quando o processo é reiniciado, e a ausência de autenticação real impede seu uso direto em produção.

Antes de uma implantação real, será necessário definir autenticação e autorização, persistência, proteção de dados, monitoramento e procedimentos de atendimento humano.
