# Tarefas — Aquisição de bilhetes (`ticket-purchase`)

**Estado:** PL6, 2026-11-24. São para executar no PL7. **Nada disto foi implementado no PL6.**
Referências: `requirements.md` (REQ-TP, AC, FD, OQ) e `design.md` (DD) desta pasta.

Regras para quem executa, humano ou agente (princípios 18 a 23):

- uma tarefa por *commit*/PR, com Conventional Commits (`feat(core-api): …`) e, se for um agente, o *trailer* `Agent-Session`;
- testes primeiro (TASK-TP-05) e falha registada em `validation.md` antes de implementar;
- não alterar critérios de aceitação nem testes para "passar"; qualquer correção de teste fica justificada em `validation.md`;
- a conclusão é sempre verificada por um comando executado, e não por uma afirmação do agente.

**Alvo mínimo do PL7:** cenário completo **AC-02 + AC-03**, ou seja, compra bem-sucedida seguida de repetição idempotente, com estado persistido. Corresponde às tarefas TP-01 a TP-08. O resto é trabalho adicional, se houver tempo.

## Ordem e dependências

```
TP-01 ─► TP-02 ─► TP-03 ─► TP-04 ─► TP-05 ─► TP-06 ─► TP-07 ─► TP-08 ─► TP-09 ─► TP-10
                                                                     └► TP-11 ─► TP-12
                                                                     └► TP-13
TP-14 (bloqueada por OQ-5/FR-18)      TP-15 (contínua, fecha o PL7)
```

## Lista

| ID | Tarefa | Requisitos / AC | Área | Depende de | Concluída quando… |
|---|---|---|---|---|---|
| TASK-TP-01 | **Confirmar decisões (humano).** A equipa revê FD-01 a FD-08 e DD-01 a DD-07 e regista em `review.md` aceitar, rejeitar ou adiar. | Todos | `.ai/sdd/specs/ticket-purchase/` | — | Todas as FD/DD têm decisão humana registada em `review.md` §1. |
| TASK-TP-02 | **Contrato OpenAPI** (contract-first, princípio 4): os 4 endpoints de `design.md` §3, com esquemas, cabeçalhos (`Idempotency-Key`, `Idempotency-Replayed`, `Retry-After`) e respostas Problem Details. | REQ-TP-01…09 | `backend/contracts/core-api.ticketing.v1.yaml` | TP-01 | O ficheiro passa num *linter* OpenAPI (ex.: `npx @redocly/cli lint`) e foi revisto por um humano contra `requirements.md`. |
| TASK-TP-03 | **Infraestrutura do `core-api`**: dependências (`pg`, `node-pg-migrate`, `jose`, `uuid`, `zod`); `config.ts`, que falha se faltar uma variável; `infra/db.ts` com `withTransaction`, *timeouts* e `isConnectionError`; script `migrate`. Configurar o `test` para incluir `test/integration/**`. | REQ-TP-09; DD-04, DD-06 | `backend/core-api` | TP-01 | `npm run typecheck` e `npm run lint` passam; `node dist/index.js` sem `DATABASE_URL` termina com uma mensagem clara. |
| TASK-TP-04 | **Migração `001_ticketing.sql`** com as 3 tabelas, as restrições de `design.md` §2 e o *seed* FD-03. | REQ-TP-01, 03, 04, 10; FD-03 | `backend/core-api/migrations` | TP-03 | Numa BD vazia (`docker compose up -d postgres`), `npm run migrate --workspace backend/core-api -- up` cria as tabelas e 3 tipos. Inserir duas aquisições com o mesmo `(passenger_id, idempotency_key)` falha com `unique_violation` (verificado por um teste). |
| TASK-TP-05 | **Testes de aceitação primeiro (vermelho).** Utilitários de teste: BD de teste com migração e `TRUNCATE` entre testes, e geração de JWT de teste. Testes executáveis para AC-01 a AC-10, AC-13 e AC-14, um `test()` por AC, com o nome no formato `should … when …` e o ID AC no título. | AC-01…10, 13, 14 | `backend/core-api/test/integration/ticket-purchase.acceptance.test.ts` | TP-04 | Os testes são revistos por um humano (asserções contra os AC) e executados: falham por **asserção** (`404` em rotas inexistentes), não por erros de import ou de ambiente. Comando e saída registados em `validation.md`. |
| TASK-TP-06 | **Autenticação interina**: middleware `requirePassenger` (FD-04) com `jose`, HS256, que exige `sub` UUID e `exp`; papel diferente de `passenger` → `403`; *mapping* para `401`/`403` Problem Details. Testes unitários com token ausente, inválido, expirado e com outro papel. | REQ-TP-08; AC-08 | `src/infra/auth.ts` | TP-03 | Os testes unitários de auth passam e AC-08 passa. |
| TASK-TP-07 | **Catálogo**: repositório e serviço `listTicketTypes`; rota pública `GET /v1/ticket-types`. | REQ-TP-01; AC-01 | `modules/tickets` | TP-05 | AC-01 passa. |
| TASK-TP-08 | **Aquisição idempotente**: esquemas `zod` (cabeçalho FD-08, corpo `strict`); hash canónico; transação de `design.md` §4; repetição com `Idempotency-Replayed`; `409`; `422`; montagem em `app.ts`. | REQ-TP-02…05, 08, 09, 10; AC-02, 03, 04, 05, 07, 09, 13, 14 | `modules/tickets`, `http/problem.ts` | TP-06, TP-07 | AC-02, AC-03, AC-04, AC-05, AC-07, AC-09, AC-13 e AC-14 passam. Um humano revê o SQL da transação. **(Fim do alvo mínimo.)** |
| TASK-TP-09 | **Carteira**: `GET /v1/me/tickets` com cursor e `GET /v1/me/tickets/{id}` com `404` para bilhetes alheios. | REQ-TP-07; AC-02 (parte da consulta), AC-10 | `modules/tickets` | TP-08 | AC-10 passa e há um teste de paginação (25 bilhetes → 20 + `nextCursor`, depois 5 + `null`). |
| TASK-TP-10 | **Teste de concorrência** AC-06: dois pedidos em paralelo (`Promise.all`) com a mesma chave. | REQ-TP-06; AC-06 | `test/integration` | TP-08 | AC-06 passa em 20 execuções consecutivas (`--test-concurrency` / ciclo) sem falhas. |
| TASK-TP-11 | **Falha de BD** AC-12: apontar o pool para uma porta fechada (ou parar o contentor) → `503` + `Retry-After`; repor → a mesma chave conclui uma vez. Sem `sleep` fixo (convenções). | REQ-TP-09; AC-12 | `test/integration`, `infra/db.ts` | TP-08 | AC-12 passa e o pedido falhado termina em menos de 5 s (*timeout* de ligação de 2 s). |
| TASK-TP-12 | **Snapshot e versão** AC-11. | REQ-TP-03; AC-11 | `test/integration` | TP-08 | AC-11 passa. |
| TASK-TP-13 | **Integração com compose e CI**: variáveis do `core-api` em `compose.yaml` e `scripts/dev.mjs`; `MIGRATE_ON_START`; migrações copiadas no `backend/Dockerfile`; `services: postgres` + `TEST_DATABASE_URL` no `source-checks`. | DD-04, DD-06; NFR-8 | `compose.yaml`, `scripts/`, `.github/workflows/pipeline.yml`, `backend/Dockerfile` | TP-08 | O pipeline de um PR fica verde (`source-checks` com os testes de integração e `container-smoke`), com o link para o *run* registado em `validation.md`. |
| TASK-TP-14 | **Frontend (bloqueada).** A vista "Bilhetes" passa a usar a API; a chave é gerada por intenção de compra e reutilizada no retry; a carteira vem de `/api/v1/me/tickets`. | REQ-TP-11 | `frontend/src` | TP-09, **OQ-5 / FR-18 (login)** | Desbloqueia quando existir login. Teste E2E (Playwright, planeado): comprar, perder a resposta (rede simulada) e repetir → 1 bilhete. |
| TASK-TP-15 | **Evidência (PL7)**: `validation.md` com âmbito, rastreabilidade, comandos e resultados reais, uso de IA, decisões humanas e limitações. | Todos | `.ai/sdd/specs/ticket-purchase/validation.md` | Contínua | O ficheiro segue o modelo do PL7 e todos os "Pass" correspondem a comandos efetivamente executados. |

## Tarefas bloqueadas ou condicionadas

- **TASK-TP-14**: bloqueada por OQ-5 (não há emissão de tokens nem login). Não se cria um *endpoint* "dev token" sem decisão explícita da equipa, porque seria um risco de segurança se chegasse à produção.
- **TASK-TP-01**: condiciona todas as outras. Se a equipa rejeitar FD-04 (JWT interino), as tarefas TP-06 a TP-14 têm de ser revistas.
