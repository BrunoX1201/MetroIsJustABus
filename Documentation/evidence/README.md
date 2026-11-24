# Evidência do processo assistido por IA

Esta pasta reúne a evidência exigida pelo enunciado (v1.1, secções 1, 4 e 5 — *Measurement & Critical Analysis*, 30%). Regista:

- as tarefas delegadas em LLMs e agentes;
- a autonomia dos agentes e a intervenção humana;
- os resultados de validação;
- os defeitos e o retrabalho;
- o comportamento do pipeline CI/CD.

O objetivo é poder responder, no relatório final, **onde a IA foi eficaz, onde falhou e que práticas detetaram ou evitaram problemas**, com dados e não com impressões.

Começou a ser recolhida de forma sistemática em 2026-11-24. O que aconteceu antes foi reconstruído a partir do Git e de `Documentation/Requirements.md` §10, e está identificado como **retroativo**.

## Estrutura

| Caminho | Conteúdo | Quem atualiza |
|---|---|---|
| `ai-sessions.csv` | Uma linha por sessão de trabalho com IA (registo principal, agregável) | Quem conduziu a sessão, no mesmo PR |
| `sessions/AAAA-MM-DD-<tema>.md` | Registo detalhado de sessões relevantes: instruções representativas, o que foi aceite e rejeitado, intervenções | Quem conduziu a sessão |
| `templates/session.md` | Modelo para os registos detalhados | — |
| `ci/runs.csv` | Exportação das execuções do GitHub Actions | `scripts/evidence/export-ci-runs.sh` (manual ou periódico) |
| `.ai/sdd/specs/<feature>/review.md`, `validation.md` | Findings de revisão e validação por funcionalidade (PL6/PL7) | Equipa |

Não se guardam conversas completas, segredos, tokens nem dados pessoais (princípio 17). Excertos curtos de instruções bastam.

## Colunas de `ai-sessions.csv`

| Coluna | Significado |
|---|---|
| `session_id` | `S-AAAAMMDD-NN` |
| `date` | Data (UTC) |
| `member` | Membro responsável pela sessão |
| `tool_model` | Ferramenta e modelo (ex.: `Claude app / Claude Opus 5.5`, `Codex`, `ChatGPT`) |
| `phase` | `requirements`, `design`, `implementation`, `testing`, `ci-cd`, `deployment`, `docs`, `review` |
| `refs` | IDs rastreáveis (FR/NFR/REQ/TASK/PL) |
| `task` | Descrição curta do que foi delegado |
| `autonomy` | **A0** sugestão lida por humano · **A1** gera artefacto que o humano edita · **A2** gera e verifica (corre comandos), humano revê antes do merge · **A3** executa ponta a ponta (inclui push/PR), humano só aprova |
| `human_interventions` | N.º de vezes que um humano teve de decidir, corrigir ou desbloquear durante a sessão |
| `ai_findings_accepted` / `ai_findings_rejected` | Findings ou sugestões da IA aceites ou rejeitados pela equipa |
| `defects_found` | Defeitos encontrados nos artefactos da IA (por revisão, testes ou CI) |
| `defects_by` | Quem ou o que os detetou: `human`, `ai-self-review`, `tests`, `ci`, `n/a` |
| `rework_iterations` | Iterações extra até o resultado ser aceite |
| `validation` | Comandos ou verificações executados e resultado (ex.: `npm test pass 6/6`) |
| `commits_pr` | SHA(s) e/ou PR |
| `effort_min` | Esforço humano aproximado em minutos (preparar, rever, corrigir) |
| `notes` | Observações curtas |

## Regras de recolha

1. **Uma sessão de IA sem linha no CSV não aconteceu** para efeitos de análise. Acrescentem a linha no mesmo PR que integra o resultado.
2. Os commits gerados por agentes levam o *trailer* `Agent-Session: <id ou link>` (`conventions.md`). Os commits humanos com contributo de IA relevante levam `AI-Assisted: <ferramenta>`.
3. Os PRs preenchem a secção "Uso de IA" do *template* (`.github/pull_request_template.md`).
4. Um defeito detetado pelo pipeline num código gerado por IA regista-se em `defects_found`, com `defects_by = ci`.
5. Quando um agente falha a mesma tarefa duas vezes (princípio 23), cria-se um registo em `sessions/` com a descrição do incidente.
6. `ci/runs.csv` é atualizado pelo menos antes de cada milestone: `bash scripts/evidence/export-ci-runs.sh` (requer `gh` autenticado).

## Métricas previstas para o relatório final

- Distribuição das sessões por fase e por nível de autonomia.
- Intervenções humanas por sessão e por fase.
- Taxa de aceitação de findings e sugestões da IA.
- Defeitos por artefacto gerado e quem os detetou (humano, auto-revisão, testes, CI).
- Retrabalho (iterações) por tipo de tarefa.
- Pipeline: taxa de sucesso, duração e causas de falha, a partir de `ci/runs.csv`.
- Ligação de cada sessão a requisitos e tarefas (`refs`) para rastreabilidade.
