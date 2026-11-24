# Design preliminar — Aquisição de bilhetes (`ticket-purchase`)

**Estado:** preliminar (PL6), 2026-11-24. Deriva de `requirements.md` desta pasta e de `.ai/steering/` (rev. 1.1).
Não é um desenho completo. Fixa apenas o necessário para orientar as tarefas do PL7. As escolhas novas estão identificadas como **DD-xx**; as decisões funcionais **FD-xx** estão em `requirements.md` §5.2.

## 1. Componentes e responsabilidades

| Componente | Responsabilidade nesta funcionalidade | Alteração |
|---|---|---|
| `frontend` (React) | Vista "Bilhetes": catálogo, compra e carteira através da API. Gera e guarda uma `Idempotency-Key` por intenção de compra. | REQ-TP-11, **bloqueado** (OQ-5) |
| Nginx (`frontend/nginx.conf`) / proxy Vite | Encaminham `/api/*` para `core-api` e retiram o prefixo `/api`. | Nenhuma |
| `core-api`, módulo `tickets` | Autoridade sobre o catálogo, as aquisições e os bilhetes. Valida a entrada, autentica, aplica a idempotência e executa a transação. | Novo |
| `core-api`, `infra/db` | Pool `pg`, migrações (`node-pg-migrate`) e mapeamento de erros de ligação. | Novo |
| `core-api`, `infra/auth` | Middleware `requirePassenger` que verifica o JWT (FD-04). | Novo |
| PostgreSQL `metro_core` | Tabelas `ticket_types`, `ticket_purchases` e `tickets`, com as restrições de unicidade. | Novo esquema |
| `validation-service`, `notification-service`, RabbitMQ | Não participam. | Nenhuma |

A funcionalidade **não precisa de comunicação distribuída**: tudo se decide dentro do `core-api` e numa única transação. O PL6 pede expressamente que não se introduzam componentes desnecessários (ver DD-05).

Estrutura no `core-api`, segundo `conventions.md` rev. 1.1:

```
backend/core-api/src/
  app.ts                          # monta /v1 com o router de tickets
  index.ts                        # lê config, corre migrações (DD-04), arranca
  config.ts                       # DATABASE_URL, AUTH_JWT_SECRET, PORT (falha se faltarem)
  infra/db.ts                     # Pool, withTransaction(), isConnectionError()
  infra/auth.ts                   # requirePassenger middleware
  http/problem.ts                 # DomainError -> Problem Details
  modules/tickets/
    tickets.routes.ts
    tickets.service.ts
    tickets.repository.ts
    tickets.schemas.ts            # zod: body, headers, query
    tickets.test.ts               # unit (service com repositório real em BD de teste)
backend/core-api/migrations/
  001_ticketing.sql               # tabelas + seed FD-03
backend/core-api/test/integration/
  ticket-purchase.acceptance.test.ts   # AC-01..AC-13
backend/contracts/
  core-api.ticketing.v1.yaml      # OpenAPI 3.1 (contract-first, princípio 4)
```

## 2. Entidades e dados

```sql
-- ticket_types: catálogo vigente (uma linha por tipo; a versão sobe quando muda)
id uuid PK, code text UNIQUE, name text, description text,
price_cents integer CHECK (price_cents >= 0), currency char(3) CHECK (currency = 'EUR'),
validity_kind text CHECK (validity_kind IN ('journeys','duration')),
journeys integer NULL, duration_minutes integer NULL,
CHECK ((validity_kind='journeys' AND journeys > 0 AND duration_minutes IS NULL)
    OR (validity_kind='duration' AND duration_minutes > 0 AND journeys IS NULL)),
on_sale boolean, version integer CHECK (version >= 1), created_at, updated_at

-- ticket_purchases: registo histórico da operação (nunca apagado, REQ-TP-10)
id uuid PK, passenger_id uuid, idempotency_key text, request_hash char(64),
ticket_type_id uuid FK, ticket_type_version integer,
amount_cents integer, currency char(3),
payment_method text CHECK (payment_method = 'simulated'), payment_status text CHECK (payment_status = 'approved'),
response_body jsonb,                       -- resposta original, para a repetição (FD-07)
created_at, updated_at,
UNIQUE (passenger_id, idempotency_key)     -- REQ-TP-04/05/06, FD-05

-- tickets: direito adquirido, com cópia das condições (REQ-TP-03)
id uuid PK, passenger_id uuid, purchase_id uuid UNIQUE FK -> ticket_purchases,
ticket_type_id uuid FK, ticket_type_version integer, name text,
price_paid_cents integer, currency char(3),
validity_kind text, journeys integer NULL, duration_minutes integer NULL,
status text CHECK (status IN ('issued')),  -- FD-02; Q-02 acrescenta estados
purchased_at timestamptz, created_at, updated_at
INDEX (passenger_id, purchased_at DESC, id DESC)   -- carteira paginada
```

- **Identificadores**: UUID v7, gerados com o pacote `uuid` (`v7()`), seguindo as convenções. O PostgreSQL 17 não tem uma função nativa para UUID v7.
- **`passenger_id`**: sem chave estrangeira, porque ainda não existe a tabela de contas (FR-18). Quando existir, acrescenta-se a FK numa migração nova.
- **`request_hash`**: SHA-256 do JSON canónico (chaves ordenadas) do corpo validado, por exemplo `{"ticketTypeId":"…"}`.
- **DD-01**: o catálogo é versionado com um número de versão na própria linha, e o bilhete guarda uma cópia das condições. A alternativa era uma tabela `ticket_type_versions`, que daria um histórico completo do catálogo, mas a gestão do catálogo está fora do âmbito. A cópia no bilhete é suficiente para REQ-TP-03 e NFR-7. A decisão pode ser revista quando se especificar a gestão do catálogo.

## 3. Interfaces (resumo; o contrato completo é o OpenAPI da tarefa TASK-TP-02)

Caminhos tal como o browser os usa. O `core-api` monta-os sem `/api` (convenções, secção HTTP routes).

| Operação | Autenticação | Sucesso | Erros |
|---|---|---|---|
| `GET /api/v1/ticket-types` | Pública | `200 {items: TicketType[]}` | `503` |
| `POST /api/v1/ticket-purchases`, cabeçalhos `Authorization`, `Idempotency-Key`; corpo `{ticketTypeId: uuid}` | `passenger` | `201 {purchaseId, ticket: Ticket}`; na repetição, igual + `Idempotency-Replayed: true` | `400`, `401`, `403`, `409 idempotency-key-reused`, `422 ticket-type-not-available`, `503` + `Retry-After: 5` |
| `GET /api/v1/me/tickets?limit=20&cursor=…` | `passenger` | `200 {items: Ticket[], nextCursor: string \| null}` | `400`, `401`, `403`, `503` |
| `GET /api/v1/me/tickets/{ticketId}` | `passenger` | `200 Ticket` | `401`, `403`, `404`, `503` |

```jsonc
// TicketType
{ "id": "0193…", "code": "single", "name": "Viagem simples", "description": "…",
  "priceCents": 200, "currency": "EUR", "validity": { "kind": "journeys", "journeys": 1 }, "version": 1 }
// Ticket
{ "id": "0193…", "ticketTypeId": "0193…", "ticketTypeVersion": 1, "name": "Viagem simples",
  "pricePaidCents": 200, "currency": "EUR", "validity": { "kind": "journeys", "journeys": 1 },
  "status": "issued", "purchasedAt": "2026-11-24T15:00:00.000Z" }
```

- **Paginação**: o cursor é opaco, codificado em base64url a partir de `(purchased_at, id)` do último item. `limit` vai de 1 a 100 (por omissão, 20).
- **DD-02**: o `GET` do detalhe de um bilhete alheio devolve `404` e não `403`, para não revelar que o bilhete existe (REQ-TP-07).

## 4. Fluxo principal e idempotência

```mermaid
sequenceDiagram
  participant W as Web (SPA)
  participant N as Nginx
  participant C as core-api /v1/ticket-purchases
  participant DB as PostgreSQL metro_core
  W->>N: POST /api/v1/ticket-purchases (Bearer, Idempotency-Key K, {ticketTypeId})
  N->>C: POST /v1/ticket-purchases
  C->>C: requirePassenger (JWT) → passengerId; zod valida header/corpo; hash = sha256(corpo)
  C->>DB: (1) SELECT request_hash, response_body FROM ticket_purchases WHERE passenger_id=… AND idempotency_key=K
  alt já existe
    alt mesmo hash
      C-->>W: 201 response_body + Idempotency-Replayed: true
    else hash diferente
      C-->>W: 409 idempotency-key-reused
    end
  else não existe
    C->>DB: (2) BEGIN; SELECT tipo WHERE id=… AND on_sale FOR SHARE
    alt tipo inexistente/fora de venda
      C->>DB: ROLLBACK
      C-->>W: 422 ticket-type-not-available
    else tipo disponível
      C->>DB: INSERT ticket_purchases … ON CONFLICT (passenger_id, idempotency_key) DO NOTHING RETURNING id
      alt inseriu
        C->>DB: INSERT tickets (snapshot do tipo); UPDATE ticket_purchases SET response_body=…; COMMIT
        C-->>W: 201 {purchaseId, ticket}
      else conflito (pedido concorrente confirmou primeiro)
        C->>DB: ROLLBACK
        C->>C: voltar a (1) — devolve repetição ou 409
      end
    end
  end
```

Notas:

- **A procura da chave vem antes da verificação do tipo (1 → 2)**, para que uma repetição devolva o resultado original mesmo que, entretanto, o tipo tenha saído de venda ou mudado de versão. Ver o finding R-05 em `review.md`.
- **Concorrência (REQ-TP-06)**: com o mesmo par (passageiro, chave), o segundo `INSERT … ON CONFLICT DO NOTHING` fica à espera do *commit* da primeira transação e depois não insere nada. O segundo pedido segue então o ramo "conflito", volta a (1) e lê o resultado já confirmado. Se a primeira transação fizer *rollback*, o segundo `INSERT` é bem-sucedido e conclui ele próprio a operação. Assim fica garantido no máximo um bilhete, sem *locks* aplicacionais.
- **Repetição de um pedido rejeitado**: as respostas `4xx` não ficam registadas. Uma repetição volta a ser avaliada, o que é seguro porque não houve efeitos.
- **DD-03**: a resposta original fica guardada em `response_body` (`jsonb`), o que garante que a repetição é igual byte a byte em significado (FD-07). A alternativa seria reconstruí-la a partir das tabelas, com o risco de divergir se o formato mudar.

## 5. Decisões, alternativas e questões

| ID | Decisão | Alternativas rejeitadas | Requisitos |
|---|---|---|---|
| DD-01 | Versão na linha do tipo + cópia das condições no bilhete | Tabela de versões do catálogo | REQ-TP-03 |
| DD-02 | `404` para um bilhete alheio | `403` | REQ-TP-07 |
| DD-03 | Guardar a resposta original para a repetição | Reconstruir a resposta | REQ-TP-04, FD-07 |
| DD-04 | O `core-api` aplica as migrações no arranque (`MIGRATE_ON_START=true` em dev/CI). As migrações são sempre compatíveis com a versão anterior (convenções). | Passo separado do pipeline / contentor de migração dedicado | Infra. **A rever antes do blue-green em produção** (as duas cores arrancariam com migrações). |
| DD-05 | Sem evento `ticket.purchased` nem *outbox* nesta funcionalidade | Publicar já pelo *outbox* | Nenhum consumidor o exige; evita complexidade (PL6). Fica para quando ocupação ou notificações precisarem. |
| DD-06 | Testes de integração com o PostgreSQL real, via `TEST_DATABASE_URL`. Localmente usa-se o Postgres do `compose.yaml`; no CI, um *service container* `postgres:17-alpine` no job `source-checks`. | Testcontainers (planeado); mocks de BD | Princípio 19 (tech-stack: os mocks não validam transações). Evita uma dependência nova. |
| DD-07 | Validação com `zod` | Validação manual | tech-stack (Zod planeado) |

Questões em aberto relevantes para o desenho: OQ-2 (preço vigente), OQ-3 (retenção) e OQ-5 (autenticação definitiva). Ver `requirements.md` §9.

## 6. Falhas, segurança e consistência

| Situação | Comportamento | Requisito |
|---|---|---|
| BD inacessível ou *timeout* da ligação | Erro de ligação do `pg` mapeado para `503` + `Retry-After: 5`. Não há efeitos parciais, porque a transação nunca chega a *commit*. Pool com `connectionTimeoutMillis` de 2000 ms e `statement_timeout` configurado. | REQ-TP-09; princípio 10 (sem chamadas sem *timeout*) |
| Resposta perdida depois do *commit* | O cliente repete com a mesma chave e recebe a resposta original. | REQ-TP-04 |
| Falha a meio da transação | *Rollback*: nem aquisição nem bilhete. | REQ-TP-09 |
| Erro inesperado | `500` genérico. O log inclui `traceId`, código e erro completo; a resposta não inclui detalhes. | convenções (Errors) |
| Autorização | O `passengerId` vem só de `sub`. Um corpo com `passengerId` é rejeitado (`400`, `zod` em modo `strict`). Um token válido sem `role = "passenger"` recebe `403` (convenções: `401` não autenticado, `403` proibido). | princípio 15; convenções |
| Segredos | `AUTH_JWT_SECRET` e `DATABASE_URL` vêm do ambiente. Em dev, o `compose.yaml` tem valores apenas de desenvolvimento, à semelhança das passwords de `init.sql`. O token nunca é registado em log. | princípio 17; REQ-TP-10 |
| Dados pessoais | Nenhum dado pessoal é recolhido nem registado em log; o pagamento é simulado e não tem campos de pagamento. | NFR-5; FD-06 |
| Health check | `/health` continua a responder só sobre o processo. A disponibilidade da BD não afeta o *smoke test* (decisão a rever com a observabilidade). | NFR-8 (futuro) |

## 7. Impacto em configuração, CI e deployment

- `compose.yaml`: acrescentar ao `core-api` as variáveis `DATABASE_URL=postgres://metro_core:metro_core_dev@postgres:5432/metro_core`, `AUTH_JWT_SECRET=${AUTH_JWT_SECRET:-dev-only-insecure-secret}` e `MIGRATE_ON_START=true`. A dependência de `postgres: service_healthy` já existe.
- `scripts/dev.mjs` / `npm run dev`: exportar as mesmas variáveis para o `core-api` local (porta `55432`).
- `.github/workflows/pipeline.yml`: no job `source-checks`, acrescentar `services: postgres` e `TEST_DATABASE_URL`. A seguir, `npm test` passa a incluir os testes de integração. O `container-smoke` não muda.
- `backend/Dockerfile`: copiar `backend/core-api/migrations/` para a imagem de runtime.
