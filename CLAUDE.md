# MetroIsJustABus — instruções para agentes

Este ficheiro dá contexto a agentes de IA (Claude Code, Codex, etc.). As regras completas estão nos ficheiros de *steering*. Este ficheiro não os substitui: aponta para eles.

## Fontes de verdade (por ordem)

1. Enunciado oficial: `Automated_Software_Development_Project_Complete.v1.1.pdf`
2. `Documentation/Requirements.md`: IDs FR/NFR/A/Q/D
3. `.ai/steering/`: `product.md`, `tech-stack.md`, `conventions.md`, `principles.md`
4. Especificações por funcionalidade: `.ai/sdd/specs/<feature>/` (`requirements`, `design`, `tasks`, `review`, `validation`)

Uma tecnologia marcada como **Planned** em `tech-stack.md` ainda não existe. Não assumas que existe.

## Comandos de verificação

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
docker compose --profile container build && docker compose --profile container up -d --no-build --wait && node scripts/smoke.mjs   # smoke em contentores
```

## Regras obrigatórias

- Não inventes regras de negócio. Se o enunciado e a especificação não decidirem uma questão, para e pergunta (princípio 22).
- Não alteres testes nem critérios de aceitação para os pôr a passar sem justificação registada e aprovação humana (princípio 20).
- Usa Conventional Commits, com o *trailer* `Agent-Session: <id ou link>`. Trabalha em branch e integra só por PR com o pipeline verde (princípio 18).
- Nunca coloques segredos no repositório, nos logs ou nas imagens (princípio 17).
- **Evidência:** no fim de cada sessão, acrescenta uma linha a `Documentation/evidence/ai-sessions.csv` (formato em `Documentation/evidence/README.md`). Em sessões relevantes, cria também `Documentation/evidence/sessions/AAAA-MM-DD-<tema>.md` a partir do modelo. Regista com honestidade os defeitos, as correções humanas e o que não foi verificado.
