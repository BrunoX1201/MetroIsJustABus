# Sessão S-20261124-01 — Integridade do repositório e PL6 (compra de bilhete)

| Campo | Valor |
|---|---|
| Data | 2026-11-24 |
| Membro responsável | Bruno Sampaio |
| Ferramenta / modelo | Claude app (Anthropic), Claude Opus 5.5. Teve acesso aos PDFs do projeto (enunciado v1.1, PL5–PL8) e ao repositório: primeiro só de leitura, depois com push. |
| Fase | review, requirements, design, docs |
| Refs | PL5, PL6; FR-9, FR-10, FR-11, FR-18; REQ-TP-01..11; TASK-TP-01..15 |
| Autonomia | **A2** na primeira parte: gerou e verificou, sem escrita no repositório, e entregou um patch. **A3** na segunda: com autorização, fez push da branch e abriu o PR #1. O merge fica com a equipa. |
| Commits / PR | `840ebc2` (PL6 + correções), `68bce48` (evidência); PR #1 (`docs/pl6-ticket-purchase-spec`) |
| Esforço humano (min) | *a preencher pelo Bruno* |

## Objetivo e contexto fornecido

Instrução inicial: *"Analisa todo o teu contexto… Verifica a integridade do projeto e coerência entre ficheiros. Faz ou indica os passos para realizar o PL6."*

O assistente leu:

- o enunciado v1.1 e as fichas PL5–PL8;
- todos os ficheiros do repositório;
- o histórico Git e as branches remotas;
- os resultados do GitHub Actions (na segunda parte).

## Resultado

1. **Relatório de coerência** com 11 pontos. Os principais:
   - o caminho `.ai/streering` estava mal escrito;
   - o *steering* não correspondia ao código (NestJS, Vitest, Node 22, PG16 e RMQ 3.13 descritos; Express 5, `node:test`, Node 24, PG17 e RMQ 4 no código);
   - ferramentas e práticas eram descritas como existentes sem o serem (OpenAPI, ADR, `CLAUDE.md`, evidência);
   - o `product.md` tinha uma regra inventada (estados de bilhete);
   - a tabela 9.2 dos `Requirements.md` estava partida;
   - o README contradizia-se sobre os runners;
   - não havia registo de evidência de IA.
2. **Correções aplicadas**, segundo a escolha da equipa: renomear para `.ai/steering`; alinhar o *steering* com o código; marcar "In use"/"Planned"; corrigir os documentos; limpar o `product.md`.
3. **Especificação SDD da compra de bilhete** em `.ai/sdd/specs/ticket-purchase/`: `requirements.md`, `design.md`, `tasks.md` e `review.md`.
4. **Segunda parte** (autorizada): PR no GitHub; README atualizado; arranque desta pasta de evidência; `CLAUDE.md`; *template* de PR; exportação dos *runs* de CI.
5. **Não concluído**: apagar as branches `RequirementsUpdate` (`7b575c5`) e `requirements-changes` (`838c17b`). A sessão não tinha permissão: o proxy recusou tanto `git push --delete` como a API REST. Ficou para um humano. Os SHAs ficam aqui registados para se poder recuperar as branches.

## Intervenção humana

| # | Momento | Tipo | Descrição |
|---|---|---|---|
| 1 | Antes do PL6 | Decisão | Funcionalidade escolhida: compra de bilhete (entre 4 opções propostas). |
| 2 | Antes do PL6 | Decisão | O *steering* passa a seguir o código, em vez de migrar o código para NestJS. |
| 3 | Antes do PL6 | Decisão | Correções a aplicar: renomear a pasta, corrigir os documentos, retirar do `product.md` as regras inventadas. |
| 4 | Antes do PL6 | Decisão | Forma de entrega: pasta local. Não foi possível porque a pasta não estava ligada; usou-se o patch e depois o GitHub. |
| 5 | Segunda parte | Desbloqueio / autorização | Acesso de push concedido; informação de que o runner estava ativo; autorização para apagar 2 branches e iniciar a evidência. |

## Findings e defeitos

| # | Descrição | Detetado por | Decisão | Retrabalho |
|---|---|---|---|---|
| R-01 | *Steering* incoerente com o código | IA | Aceite pela equipa | Reescrita do `tech-stack.md` e de parte do `conventions.md` |
| R-02 | `product.md` com estados de bilhete não suportados pelo enunciado | IA | Aceite pela equipa | Edição do `product.md` |
| R-05 | **Defeito no rascunho da própria IA**: a idempotência era verificada depois da validação do tipo, e uma repetição podia devolver `422` | IA (auto-revisão) | Corrigido | 1 iteração no `design.md`; AC-14 acrescentado |
| R-06 | **Defeito no rascunho da própria IA**: `401` em vez de `403` para um papel errado, contra as convenções | IA (auto-revisão) | Corrigido | REQ-TP-08, `design.md`, TASK-TP-06 |
| — | Afirmação inicial da IA de que a Milestone 2 podia não cumprir o deploy em dev, baseada no README | Humano (informou que o runner estava ativo) | A IA confirmou no GitHub Actions: o *run* `44117131119` (2026-11-17) concluiu `deploy-development` com sucesso | README corrigido |

Os restantes findings (R-03, R-04, R-07 a R-10) estão em `review.md` como propostas, pendentes de confirmação pela equipa (TASK-TP-01).

## Validação executada

- `npm ci && npm run lint && npm run typecheck && npm test && npm run build` no commit `6f49046`, com Node 22.23: tudo OK; testes 6/6 pass.
- Depois das alterações: `npm run lint` OK; `npm test` 6/6 pass (só mudaram documentos).
- `diff` do texto extraído (`pdftotext`) do enunciado v1.0 vs v1.1: a única alteração de conteúdo é a linha sobre os VMs do DEI Helpdesk.
- Páginas citadas S-1 a S-8 confirmadas com `pdftotext -f N -l N`.
- Script de verificação cruzada: todos os IDs AC/REQ/FD/DD referidos estão definidos; tabelas Markdown com número de colunas consistente.
- `gh run view 44117131119`: os 8 jobs com `success`, incluindo `deploy-development`.

## Reflexão

O assistente foi eficaz a detetar incoerências entre documentos e código, e a separar o que é exigido pelo enunciado das decisões da equipa. A auto-revisão encontrou dois defeitos reais no seu próprio rascunho. Falhou ao inferir o estado do runner a partir do README desatualizado: foi preciso o humano corrigir. Lição: verificar o estado real (CI) antes de afirmar incumprimentos. As decisões de âmbito (funcionalidade, stack, autenticação interina) ficaram com a equipa.
