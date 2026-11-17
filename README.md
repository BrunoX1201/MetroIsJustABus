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

O workflow [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml) corre em `pull_request`, em pushes para `main` e manualmente com `workflow_dispatch`. Todos os jobs usam runners temporários do GitHub. A execução segue esta ordem:

| Job | Quando corre | O que faz |
|---|---|---|
| `source-checks` | PR e `main` | `npm ci`, ESLint, TypeScript, testes e build dos quatro workspaces |
| `container-smoke` | PR e `main` | Constrói as quatro imagens, arranca PostgreSQL, RabbitMQ e aplicações com Compose, executa `scripts/smoke.mjs` e remove a stack de teste |
| `publish-<serviço>` | Só `main`, após os dois checks | Publica uma imagem por aplicação no GHCR |
| `verify-published-images` | Só `main`, após a publicação | Descarrega as quatro imagens, arranca-as com Compose, repete o smoke test e guarda `release/manifest.json` como artefacto |
| `deploy-development` | Só `main`, após a verificação, quando `DEV_RUNNER_READY=true` | Atualiza a stack persistente na VM, repete o smoke test e tenta repor a última versão validada se a nova falhar |

### O que é testado

- Os testes HTTP automatizados dos três backends verificam que `GET /health` devolve `200` com a identidade correta do serviço e que uma rota inexistente devolve `404`. São testes de superfície HTTP, não de regras de negócio.
- `npm run lint` verifica o código com ESLint; `npm run typecheck` verifica TypeScript sem gerar ficheiros; `npm run build` compila os quatro workspaces.
- O smoke test em contentores consulta `/health` no Core, Validação, Notificações e frontend, verifica `/api/health` através do proxy Nginx e confirma que a página inicial responde e contém `MetroIsJustABus`.
- O último job repete o smoke test com as imagens **descarregadas do GHCR**, comprovando que os artefactos publicados podem ser instalados.

Os health checks atuais confirmam apenas que os processos HTTP respondem. Não verificam ligações reais à base de dados ou ao broker. Ainda não há testes de fluxos de domínio, interações entre backends, falhas ou recuperação. O frontend de demonstração usa dados locais; os seus exemplos de linhas, horários, perturbações, bilhetes e alertas não são testados como funcionalidades de backend.

### Artefactos e gates

As imagens publicadas seguem o padrão `ghcr.io/brunox1201/metroisjustabus/<serviço>:sha-<commit>`, para `frontend`, `core-api`, `validation-service` e `notification-service`. O namespace é calculado a partir do nome atual do repositório. As labels das imagens e o artefacto `manifest.json` registam o SHA do commit, permitindo relacionar fonte e versão instalável. Os jobs usam `GITHUB_TOKEN` para autenticar no GHCR; a leitura fora do workflow depende das permissões dos pacotes.

A publicação só começa se `source-checks` e `container-smoke` passarem. Para bloquear merges com checks falhados, é necessário configurar a proteção da branch `main` e exigir ambos os checks; o workflow, por si só, não bloqueia um merge.

Para verificar localmente a versão contentorizada antes de publicar:

```bash
docker compose --profile container build
docker compose --profile container up -d --no-build --wait
node scripts/smoke.mjs
docker compose --profile container down
```

Para instalar uma versão já publicada numa máquina com Docker e acesso ao GHCR, faça checkout do commit correspondente e defina `IMAGE_PREFIX=ghcr.io/brunox1201/metroisjustabus` e `IMAGE_TAG=sha-<commit>` no ambiente. Depois execute `docker compose --profile container pull` e `docker compose --profile container up -d --no-build --wait`. O Compose usa volumes para preservar os dados do PostgreSQL e do RabbitMQ.

### Deployment no ambiente de desenvolvimento

O job `deploy-development` está preparado para um runner Linux com as labels `self-hosted`, `linux` e `metro-dev`. Fica desativado até a variável de repositório `DEV_RUNNER_READY` ter o valor `true`, para não deixar pipelines em espera quando a VM não está acessível. Depois de ativado, cada push para `main` que passe os checks publica as imagens e atualiza a VM. Commits em branches de trabalho continuam a fazer apenas os checks de pull request.

Preparação necessária na VM:

1. Garantir acesso SSH ou VPN à rede do departamento, Docker Engine com `docker compose` e espaço para as imagens e volumes. O utilizador que executa o runner precisa de acesso ao daemon Docker. A VM tem de conseguir estabelecer ligações HTTPS de saída ao GitHub e ao GHCR.
2. No repositório GitHub, em **Settings → Actions → Runners → New self-hosted runner**, seguir as instruções para Linux e acrescentar a label `metro-dev`. Instalar o runner como serviço do sistema para arrancar após reinícios. Não configurar os jobs de PR para correr neste runner.
3. Em **Settings → Secrets and variables → Actions → Variables**, criar `DEV_RUNNER_READY=true` apenas depois de o runner aparecer como online. Opcionalmente, criar `DEV_FRONTEND_BIND_ADDRESS=0.0.0.0` para disponibilizar a porta 8080 na rede, após configurar a firewall. Por omissão, o frontend fica limitado a `127.0.0.1:8080`; pode ser consultado com um túnel SSH: `ssh -L 8080:127.0.0.1:8080 <utilizador>@<ip-da-vm>`.

O deploy usa `IMAGE_TAG=sha-<commit>` e `COMPOSE_PROJECT_NAME=metro-dev`, pelo que os volumes PostgreSQL e RabbitMQ se mantêm entre execuções. `scripts/deploy-development.sh` guarda a tag da última versão que passou no smoke test no diretório de estado do utilizador do runner. Se a atualização falhar, tenta restaurar essa versão e o job termina com erro. O token de acesso ao GHCR vem do `GITHUB_TOKEN` do job e a sessão Docker é terminada no fim. A password da VM não é guardada no repositório.

**Estado atual:** o workflow e o script estão preparados, mas o runner ainda não foi instalado na VM. O deployment persistente só fica efetivo quando os passos acima estiverem concluídos.

O PostgreSQL está em `127.0.0.1:55432` e o RabbitMQ em `127.0.0.1:5672`; a interface de gestão do broker está em `http://127.0.0.1:15672` (`metro` / `metro_dev`). Os utilizadores e bases de desenvolvimento são `metro_core`, `metro_validation` e `metro_notifications`, com passwords `<nome>_dev` definidas em `backend/infra/postgres/init.sql`. Estas credenciais destinam-se apenas ao ambiente local.

## Frontend de demonstração

O frontend apresenta exemplos fictícios de linhas, sequência de paragens, partidas, ocupação e perturbações (FR-1 a FR-4, FR-17), bem como modalidades de bilhete (FR-9/10) e subscrições a linhas (FR-19/20). A pesquisa, os filtros, os favoritos, as subscrições e a carteira de bilhetes funcionam **apenas no estado local da página**; uma atualização do browser repõe os exemplos. Os horários, preços e avisos são ilustrativos e não representam informação real de Coimbra.

Os três backends ainda só expõem `/health`. Não existem contas, compra ou validação real de bilhetes, persistência de domínio, eventos, consumidores RabbitMQ nem notificações enviadas. O indicador `Core API` na interface verifica exclusivamente `/api/health`.
