# MetroIsJustABus

Monorepositório para o projeto de Automated Software Engineering 2026/2027. A [especificação inicial](Documentation/Requirements.md) define os requisitos e a arquitetura proposta.

## Estrutura

| Pasta | Responsabilidade |
|---|---|
| `frontend/` | Aplicação React e TypeScript para passageiros e pessoal |
| `backend/core-api/` | Autoridade sobre rede, bilhética e decisão de validação |
| `backend/validation-service/` | Entrada dos clientes de validação e comunicação com o Core |
| `backend/notification-service/` | Subscrições, preferências e entrega de notificações |
| `backend/infra/` | Inicialização dos recursos de desenvolvimento local |

Cada aplicação é um workspace npm com build próprio. O frontend fala com o Core por HTTP; o proxy de desenvolvimento envia `/api/*` para `http://127.0.0.1:3001/*`. Os serviços não partilham bases de dados. O PostgreSQL local contém três bases e três utilizadores separados. RabbitMQ está disponível para os eventos previstos na arquitetura.

## Requisitos locais

- Node.js 24 (ver `.nvmrc`) e npm
- Docker com Compose para PostgreSQL e RabbitMQ

## Arranque

```bash
npm ci
npm run dev
```

O frontend fica em `http://127.0.0.1:5173`. Os endpoints de saúde ficam em:

| Serviço | URL |
|---|---|
| Core | `http://127.0.0.1:3001/health` |
| Validação | `http://127.0.0.1:3002/health` |
| Notificações | `http://127.0.0.1:3003/health` |

`npm run dev` inicia PostgreSQL e RabbitMQ com Docker Compose, espera que fiquem saudáveis e depois inicia as quatro aplicações. `Ctrl+C` encerra os processos das aplicações, incluindo os filhos dos watchers, e executa `docker compose down`. Os volumes de dados locais são preservados.

Também se pode iniciar cada aplicação separadamente com `npm run dev:frontend`, `npm run dev:core`, `npm run dev:validation` ou `npm run dev:notifications`; nesse caso, use `docker compose up -d` e `docker compose down` para gerir a infraestrutura. `npm run build` compila os quatro workspaces e `npm run typecheck` verifica TypeScript sem gerar artefactos.

O PostgreSQL está em `127.0.0.1:55432` e o RabbitMQ em `127.0.0.1:5672`; a interface de gestão do broker está em `http://127.0.0.1:15672` (`metro` / `metro_dev`). Os utilizadores e bases de desenvolvimento são `metro_core`, `metro_validation` e `metro_notifications`, com passwords `<nome>_dev` definidas em `backend/infra/postgres/init.sql`. Estas credenciais destinam-se apenas ao ambiente local.

## Estado do setup

Os três backends só expõem `/health`, que confirma que o processo HTTP está ativo. Ainda não verificam dependências nem implementam os fluxos de domínio. O frontend mostra o estado da ligação ao Core. Contratos, persistência, outbox, consumidores RabbitMQ, testes de domínio e pipeline entram nas próximas etapas.
