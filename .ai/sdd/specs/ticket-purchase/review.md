# Revisão da especificação — Aquisição de bilhetes (`ticket-purchase`)

**Data:** 2026-11-24 (PL6, Parte 5).
**Artefactos revistos:**

- `requirements.md`, `design.md` e `tasks.md` desta pasta;
- `.ai/steering/*.md`;
- enunciado v1.1 (pp. 7–9);
- `Documentation/Requirements.md`.

> **Importante para a equipa:** os artefactos e esta revisão foram redigidos com assistência de IA (ver §5). Os findings marcados "IA" foram identificados pelo assistente. As decisões marcadas **"Equipa (confirmada)"** foram tomadas pelo Bruno nesta sessão. As restantes são **propostas** e têm de ser aceites, rejeitadas ou adiadas pela equipa (TASK-TP-01). Acrescentem também os findings que vocês próprios encontrarem ao rever, com "Humano" na coluna "Identificado por".

## 1. Findings e decisões

| # | Finding | Identificado por | Decisão | Justificação |
|---|---|---|---|---|
| R-01 | O `tech-stack.md` indicava NestJS, Vitest, Node 22, PostgreSQL 16 e RabbitMQ 3.13. O código usa Express 5, `node:test`, Node 24, `postgres:17` e `rabbitmq:4`. Um agente que seguisse o *steering* geraria código incompatível com o repositório. | IA | **Aceitar** — Equipa (confirmada) | O *steering* foi alinhado com o código (rev. 1.1), com o estado "In use"/"Planned" em cada tecnologia. O `design.md` assume Express. |
| R-02 | O `product.md` fixava estados de bilhete (active/used up/expired), regra que não está no enunciado e que contradiz Q-02 (em aberto). | IA | **Aceitar** — Equipa (confirmada) | Removida do `product.md`. FD-02 limita-se a `issued`; o ciclo de vida fica para a validação. |
| R-03 | O `conventions.md` exige o prefixo `/api/v1`, mas o Nginx e o Vite retiram `/api`. Montar `/api/v1` no Express daria `404` através do proxy. | IA | **Aceitar** | As convenções passam a dizer que o cliente usa `/api/v1/…` e o backend monta `/v1/…`. O `design.md` §3 segue isto. |
| R-04 | A compra exige conta (A-01, S-3), mas FR-18 (contas e login) não está especificado nem implementado. Sem identidade, REQ-TP-02, 07 e 11 não são testáveis. | IA | **Adiar** (proposta FD-04) | Proposta: JWT interino, verificado pelo `core-api` e gerado pelos testes. O frontend (TASK-TP-14) fica bloqueado. A equipa deve confirmar ou especificar primeiro FR-18. |
| R-05 | No primeiro rascunho do `design.md`, o tipo era validado **antes** de procurar a chave de idempotência. Uma repetição depois de o tipo sair de venda devolveria `422` em vez do resultado original, o que viola REQ-TP-04 e FD-07. | IA (auto-revisão do rascunho) | **Aceitar** | O fluxo foi reordenado: (1) procurar a chave, (2) transação. Acrescentou-se AC-14 para o cobrir. |
| R-06 | O rascunho do `design.md` respondia `401` a um token válido com outro papel. As convenções definem `403` para esse caso. | IA (auto-revisão) | **Aceitar** | Corrigido em REQ-TP-08, `design.md` §3/§6 e TASK-TP-06. |
| R-07 | Ambiguidade AMB-1: "*issuing the same ticket*" pode significar deduplicar por conteúdo (impediria comprar dois bilhetes iguais) ou por operação. | IA | **Aceitar** (proposta FD-05) | Deduplicar por conteúdo impediria compras legítimas e não é exigido pelo enunciado. AC-05 torna a escolha verificável. A confirmar pela equipa. |
| R-08 | "*conditions of use*" (S-2) não tem significado operacional definido. Um critério como "o bilhete respeita as condições de uso" seria impossível de testar. | IA | **Adiar** | Nesta funcionalidade fica apenas texto descritivo; as regras executáveis pertencem a Q-02 e à validação. |
| R-09 | DD-04 (migrações no arranque) é incompatível com o *blue-green* planeado em produção, porque as duas cores executariam migrações. | IA | **Adiar** | Aceitável em dev/CI. Rever ao especificar o deployment de produção; as migrações devem ser *backward compatible* (convenções). |
| R-10 | Inicialmente ponderou-se publicar `ticket.purchased` através do *outbox* (princípio 6), mas nenhum requisito desta funcionalidade precisa de um consumidor. | IA | **Rejeitar** a introdução agora (DD-05) | O PL6 pede que não se acrescentem componentes desnecessários. Volta a ser considerado com a ocupação e as notificações. |

## 2. Matriz de rastreabilidade

| Fonte no enunciado ou decisão documentada | Requisito | Elemento de design | Tarefa | Critério de aceitação (resultado observável) |
|---|---|---|---|---|
| S-1, S-2; A-01; FR-9 | REQ-TP-01 | `GET /v1/ticket-types`; `ticket_types` | TP-02, TP-04, TP-07 | AC-01: `200` com 3 tipos, preço em cêntimos e EUR |
| S-3; A-01, A-05; FD-01, FD-06; FR-10 | REQ-TP-02 | `POST /v1/ticket-purchases`; transação §4 | TP-02, TP-08 | AC-02: `201`, bilhete `issued`, 1 aquisição `simulated`; AC-05: 2.ª chave → 2.º bilhete |
| D-05, NFR-7 | REQ-TP-03 | Cópia em `tickets`; DD-01 | TP-04, TP-12 | AC-11: bilhete mantém v1/200 após o tipo passar a v2/250 |
| S-5, S-6; D-08; FR-11; FD-05, FD-07, FD-08 | REQ-TP-04 | `UNIQUE (passenger_id, idempotency_key)`; `response_body`; passo (1) | TP-05, TP-08 | AC-03: mesmo `ticket.id` + `Idempotency-Replayed`; AC-07: `400`; AC-13: chave por passageiro; AC-14: repetição após saída de venda |
| D-08 | REQ-TP-05 | Comparação de `request_hash` | TP-08 | AC-04: `409 idempotency-key-reused`, continua 1 bilhete |
| S-6; NFR-3, NFR-4 | REQ-TP-06 | `INSERT … ON CONFLICT DO NOTHING` + nova leitura | TP-10 | AC-06: 2 pedidos em paralelo → o mesmo `ticket.id`, 1 bilhete |
| S-3; FR-18 (I) | REQ-TP-07 | `GET /v1/me/tickets[/id]`; DD-02 | TP-09 | AC-10: `P2` vê a lista vazia e `404` no bilhete de `P1` |
| Convenções (códigos, Problem Details); FD-04 | REQ-TP-08 | `requirePassenger`; `zod` strict; `http/problem.ts` | TP-06, TP-08 | AC-07 `400`; AC-08 `401`; AC-09 `422`; 0 bilhetes |
| S-5; NFR-3/4; princípios 10, 11 | REQ-TP-09 | `withTransaction`; mapeamento de erros de ligação → `503`; *timeouts* | TP-03, TP-11 | AC-12: `503` + `Retry-After`; depois da recuperação, 1 bilhete |
| S-7; FR-23; NFR-5, NFR-6 | REQ-TP-10 | `ticket_purchases` sem eliminação; logs JSON sem token | TP-04, TP-08 | AC-02 (linha de aquisição com instante UTC); inspeção dos logs no `validation.md` |
| S-3; aplicação web (p. 8) | REQ-TP-11 | Vista "Bilhetes" | TP-14 (bloqueada) | — (bloqueado por OQ-5) |

**Verificação feita:**

- todos os REQ-TP têm uma fonte no enunciado ou uma decisão documentada;
- todos são cobertos por elementos de design e por pelo menos uma tarefa de implementação e uma de validação;
- a exceção é REQ-TP-11, que está explicitamente bloqueado.

Não foram encontrados elementos de design sem requisito ou decisão que os justifique. As DD-04 e DD-06 servem a infraestrutura de teste e deployment.

## 3. Desafio de testabilidade — REQ-TP-04

Pedido feito ao assistente: *"Deriva três cenários de teste de aceitação para REQ-TP-04 sem introduzir regras de negócio novas. Se não for possível determinar o resultado esperado, assinala-o."*

| # | Cenário | Resultado esperado | Determinável? |
|---|---|---|---|
| T1 | `P1` compra com `K1`; a resposta perde-se; `P1` repete exatamente o mesmo pedido. | `201`, o mesmo `purchaseId`/`ticket.id`, `Idempotency-Replayed: true`; 1 bilhete. | Sim (REQ-TP-04 + FD-07) |
| T2 | `P1` envia um pedido sem `Idempotency-Key`. | `400`; 0 bilhetes. | Sim (REQ-TP-04 + convenções) |
| T3 | `P1` compra com `K1`; o tipo sai de venda; `P1` repete com `K1`. | — | **Não determinável no primeiro rascunho.** REQ-TP-04 (repetição = resultado original) e REQ-TP-08 (tipo fora de venda → `422`) entravam em conflito. **Clarificação:** a repetição tem prioridade (R-05), e passa a ser AC-14: `201` com o bilhete original. |

Conclusão: com a clarificação, REQ-TP-04 é testável. O desafio revelou uma ambiguidade real (R-05) que obrigou a corrigir o design.

## 4. Impacto da qualidade do *input*

O PL6 (Parte 2) propõe comparar a especificação gerada a partir de uma descrição pobre com a gerada a partir de uma descrição melhorada. **Esse exercício não foi feito nesta sessão** e não se apresentam resultados inventados. Sugestão para o fazerem na aula:

1. Dar ao assistente só "*o passageiro compra bilhetes*".
2. Comparar o resultado com `requirements.md`: idempotência, âmbito por passageiro, pagamento real vs simulado, regras inventadas.
3. Registar as diferenças aqui.

## 5. Registo de uso de IA

| Campo | Registo |
|---|---|
| Ferramenta / modelo | Claude (Anthropic), Claude Opus 5.5, na app Claude com acesso ao repositório (só leitura no GitHub) e aos PDFs do projeto. |
| Instrução representativa | "*Analisa todo o teu contexto… Verifica a integridade do projeto e coerência entre ficheiros. Faz ou indica os passos para realizar o PL6.*" Seguiram-se as escolhas da equipa: funcionalidade = compra de bilhete; *steering* segue o código; corrigir `streering`, docs e `product.md`. |
| O que a IA produziu | Relatório de coerência do repositório; correções ao *steering*, ao README e aos `Requirements.md`; os rascunhos de `requirements.md`, `design.md`, `tasks.md` e `review.md`. |
| Verificações executadas pela IA | `npm ci`, `npm run lint`, `typecheck`, `test` (6/6) e `build` no *commit* `6f49046`. `diff` do texto do enunciado v1.0 vs v1.1 (única diferença: a linha sobre os VMs do DEI). Confirmação das páginas citadas em S-1 a S-8 com `pdftotext`. |
| Correções resultantes da revisão | R-05 e R-06 foram corrigidos depois da auto-revisão do rascunho. |
| Decisões humanas | Escolha da funcionalidade; alinhar o *steering* com o código (R-01); remover as regras inventadas do `product.md` (R-02). **Pendente:** confirmar FD-01 a FD-08 e DD-01 a DD-07 (TASK-TP-01). |
