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

## Pipeline da Milestone 2

O workflow [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) corre em runners do GitHub:

1. Em pull requests e na `main`, instala as dependências com `npm ci`, executa ESLint, typecheck, testes HTTP e build.
2. Constrói as quatro imagens Docker, arranca a stack completa com Compose e verifica os serviços e o proxy do frontend. Esta stack de verificação é temporária e é removida no fim do job.
3. Apenas na `main`, publica as imagens no GitHub Container Registry com a tag `sha-<commit>` e a revisão do commit nas labels. Um job separado descarrega as imagens publicadas e repete a verificação com Compose. Quando passa, guarda um artefacto `manifest.json` com o commit e os quatro endereços das imagens.

Os checks de pull request têm os nomes `source-checks` e `container-smoke`. Para impedir merges quando falham, o proprietário do repositório deve configurar a proteção da branch `main` e exigir ambos os checks. O workflow, por si só, não bloqueia um merge.

As imagens publicadas seguem o padrão `ghcr.io/brunox1201/metroisjustabus/<serviço>:sha-<commit>`, com os serviços `frontend`, `core-api`, `validation-service` e `notification-service`. Se o repositório for transferido, o workflow usa automaticamente o novo nome em minúsculas. A visibilidade e o acesso de leitura às imagens dependem das definições do GHCR; os jobs do workflow autenticam-se com `GITHUB_TOKEN`.

Para verificar localmente a versão contentorizada antes de publicar:

```bash
docker compose --profile container build
docker compose --profile container up -d --no-build --wait
node scripts/smoke.mjs
docker compose --profile container down
```

Para instalar uma versão já publicada numa máquina com Docker e acesso ao GHCR, faça checkout do commit correspondente e defina `IMAGE_PREFIX=ghcr.io/brunox1201/metroisjustabus` e `IMAGE_TAG=sha-<commit>` no ambiente. Depois execute `docker compose --profile container pull` e `docker compose --profile container up -d --no-build --wait`. O Compose usa volumes para preservar os dados do PostgreSQL e do RabbitMQ.

Nesta fase, a pipeline comprova que produz uma versão instalável, mas o runner do GitHub é temporário: não mantém um ambiente de desenvolvimento disponível após o job. O deployment persistente e o self-hosted runner ficam para quando houver infraestrutura da equipa.

O PostgreSQL está em `127.0.0.1:55432` e o RabbitMQ em `127.0.0.1:5672`; a interface de gestão do broker está em `http://127.0.0.1:15672` (`metro` / `metro_dev`). Os utilizadores e bases de desenvolvimento são `metro_core`, `metro_validation` e `metro_notifications`, com passwords `<nome>_dev` definidas em `backend/infra/postgres/init.sql`. Estas credenciais destinam-se apenas ao ambiente local.

## Estado do setup

Os três backends só expõem `/health`, que confirma que o processo HTTP está ativo. Ainda não verificam dependências nem implementam os fluxos de domínio. O frontend mostra o estado da ligação ao Core. Contratos, persistência, outbox, consumidores RabbitMQ, testes de domínio e pipeline entram nas próximas etapas.
