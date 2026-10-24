# MetroIsJustABus — Especificação de requisitos e arquitetura inicial

**Unidade curricular:** Automated Software Engineering, 2026/2027

**Entrega:** Milestone 1 — Requirements, 27 de outubro de 2026 (5%)

**Versão:** 1.0, consolidada em 22 de outubro de 2026

**Referência:** enunciado v1.0 de 29 de setembro de 2026

**Estado:** especificação inicial; pressupostos e decisões pendentes explícitos. Aprovação humana não presumida.

## 1. Objetivo e âmbito

O MetroIsJustABus suporta uma rede urbana de autocarros e os serviços dos seus passageiros: consulta da rede, horários e viagens, aquisição e validação de bilhetes, ocupação, perturbações, subscrições e notificações. O pessoal operacional mantém a informação e consulta a atividade do sistema.

## 2. Fontes e classificação

| Código | Fonte | Conteúdo relevante |
|---|---|---|
| B1 | Enunciado, descrição técnica, pp. 7–8 | Domínio, funcionalidades, histórico e falhas |
| B2 | Enunciado, Application and Architecture, p. 8 | Web, Core e serviços independentes; fronteira de notificações |
| B3 | Enunciado, Communication and Integration, pp. 8–9 | APIs/eventos, contratos, falhas, retries e consistência |
| B4 | Enunciado, Testing and Verification, p. 9; fases, p. 3 | Testes, aceitação, interfaces e análise estática |
| B5 | Enunciado, CI/CDE/CD, p. 9 | Pipeline, artefactos, deployment e rastreabilidade |
| B6 | Enunciado, Deployment and Infrastructure, pp. 9–10; fases, p. 3 | Ambientes, runner, contentores, observabilidade e recuperação |
| B7 | Enunciado, pp. 1–3 e 10 | IA, validação, intervenção humana e métricas |
| B8 | Enunciado, pp. 4–6; estrutura, p. 2 | Entregas, prazos, avaliação e organização |

O PDF de referência, `Automated_Software_Development_Project_Complete.v1.0.pdf`, foi fornecido fora do repositório. As páginas B1–B8 são desse enunciado.

Classificação: **E** — explícito no enunciado; **I** — inferência; **A** — pressuposto provisório; **D** — decisão de desenho/âmbito. Referenciar o enunciado não lhe atribui os mecanismos técnicos propostos. Os IDs FR-1 a FR-25 e NFR-1 a NFR-9 identificam os requisitos desta especificação. As propostas da equipa são justificadas neste documento. A ligação a implementação e testes executados será acrescentada quando existirem.

## 3. Intervenientes e limites

| Interveniente | Necessidades/responsabilidades |
|---|---|
| Passageiro | Consultar rede/operação, adquirir e consultar bilhetes, consultar capacidade quando apropriado, gerir conta/subscrições/preferências |
| Pessoal operacional | Manter rede/horários/bilhética/perturbações; consultar utilização, validações e ocupação |
| Cliente de validação | Submeter tentativa e receber decisão; abstração de desenho simulada |
| Equipa | Desenvolver, verificar, entregar e operar; supervisionar IA e recolher evidência |
| Docente/avaliador | Esclarecer ambiguidades e avaliar sistema/processo |

A prioridade proposta pela equipa é consulta; aquisição/validação; perturbações/ocupação; notificações; ferramentas operacionais. Não elimina requisitos obrigatórios. A correção dos direitos de utilização prevalece sobre otimizações.

Decisões de âmbito desta especificação: uma rede/operador, web responsiva em português europeu, pagamento e validador simulados, dados fictícios. Não se prevê aplicação nativa, PWA offline, GPS, cancelas reais, planeamento multimodal, gestão de frota/manutenção/escalas, funções sociais ou faturação fiscal. São escolhas de âmbito, não proibições do enunciado.

## 4. Requisitos funcionais e rastreabilidade

Os critérios são verificações futuras, não resultados obtidos. Web designa a aplicação; Core, Validação e Notificações são os backends da secção 8.

| ID | Requisito | Classe/origem | Responsável | Aceitação prevista |
|---|---|---|---|---|
| FR-1 | Consultar linhas, paragens e sequência ordenada de paragens. | E — B1, p. 7 | Web/Core | A ordem apresentada coincide com a definida na linha. |
| FR-2 | Consultar horários segundo dia da semana e condições operacionais. | E — B1, p. 7 | Web/Core | Dias distintos apresentam a variante aplicável. |
| FR-3 | Consultar viagens planeadas e horas previstas em cada paragem. | E — B1, p. 7 | Web/Core | Viagem apresenta passagens e horas ordenadas. |
| FR-4 | Apresentar informação considerando alterações conhecidas à operação. | E — B1, p. 7 | Web/Core | Viagem afetada apresenta alteração, além do plano original. |
| FR-5 | Permitir ao pessoal manter rede, horários e viagens. | E — B1, p. 7 | Web/Core | Alteração autorizada fica disponível sem destruir contexto histórico. |
| FR-6 | Registar atrasos, cancelamentos, desvios e outras perturbações. | E — B1, p. 7 | Web/Core | Registo identifica tipo e efeito. |
| FR-7 | Identificar linhas, paragens, viagens/períodos afetados e gerir perturbações. | E — B1, p. 7 | Web/Core | Alteração/encerramento atualiza âmbito e aplicação temporal. |
| FR-8 | Conter informação suficiente para comunicar o efeito da perturbação. | I — B1, p. 7 | Core | Atraso indica desfasamento; cancelamento identifica serviço; desvios seguem Q-05. |
| FR-9 | Refletir criação, atualização e fim de perturbações nas consultas. | E/I — B1, p. 7 | Web/Core | Consulta posterior apresenta situação vigente. |
| FR-10 | Suportar tipos de bilhete distintos em preço, validade, condições ou viagens e permitir gestão operacional. | E — B1, p. 7 | Core | Tipos aplicam regras distintas aprovadas em Q-02. |
| FR-11 | Adquirir bilhetes e consultar os associados à conta. | E — B1, p. 7; conta na compra: A-01 | Web/Core | Aquisição concluída disponibiliza bilhete na conta correta. |
| FR-12 | Retry da mesma aquisição não emite bilhetes adicionais. | E — B1, p. 8 | Core | Repetição devolve aquisição original. |
| FR-13 | Avaliar tipo, estado, validações anteriores e instante antes de aceitar utilização. | E — B1, p. 7 | Validação/Core | Aceitar/recusar segundo regras, com motivo definido no contrato. |
| FR-14 | Registar duravelmente sucessos e atualizar coerentemente os direitos do título. | E/I — B1, p. 7 | Core | Registo e consumo aplicável na mesma transação. |
| FR-15 | Retry da mesma validação não duplica registo nem consumo. | E — B1, p. 8 | Validação/Core | Resultado original sem efeito adicional. |
| FR-16 | Consultar utilização de bilhetes e atividade de validação pelo pessoal. | E — B1, p. 7 | Web/Core | Relacionar registos com bilhete e contexto disponível. |
| FR-17 | Acompanhar ocupação/capacidade considerando atividade dos passageiros, incluindo validações. | E — B1, p. 7 | Core | Aceitação influencia estimativa segundo Q-03; retry não incrementa novamente. |
| FR-18 | Disponibilizar capacidade/ocupação ao pessoal e, quando apropriado, passageiros. | E — B1, p. 7 | Web/Core | Dados adequados ao perfil e política Q-03. |
| FR-19 | Criar conta e autenticar acesso a dados pessoais. | E — criação: B1, p. 7; I — autenticação | Web/Core | Conta autentica-se; não consulta bilhetes privados de outra. |
| FR-20 | Subscrever informação de linhas, paragens ou viagens. | E — B1, p. 7 | Notificações/Web | Subscrição identifica passageiro e alvo. |
| FR-21 | Controlar subscrições e preferências de notificação. | E — B1, p. 7 | Notificações/Web | Alterar/cancelar modifica seleção futura. |
| FR-22 | Identificar afetados por alterações relevantes e notificá-los sem duplicados em retries. | E — B1, pp. 7–8 | Core/Notificações | Reentrega não cria nova notificação lógica. |
| FR-23 | Consultar histórico pessoal de notificações. | D — proposta da equipa; vista específica não exigida em B1 | Notificações/Web | Conta consulta apenas o seu histórico; adicional sujeito a revisão de âmbito. |
| FR-24 | Autorizar operações de pessoal e registar autor/ação/instante. | I/D — B1, p. 7 | Backends | Passageiro não executa operações reservadas; mudanças rastreáveis. |
| FR-25 | Preservar histórico suficiente para compreender atividade anterior. | I — B1, pp. 7–8 | Core/Notificações | Mudanças não eliminam contexto passado; retenção em Q-07. |

## 5. Requisitos não funcionais

| ID | Requisito | Classe/origem | Verificação prevista |
|---|---|---|---|
| NFR-1 | Falha de notificações não impede consultas de rede/horários nem funções independentes. | E — B1, p. 8 | Parar notificações e executar consultas/validações independentes. |
| NFR-2 | Tratar timeouts, comunicação e indisponibilidade sem cascatas desnecessárias. | E — B1/B3, pp. 8–9 | Injetar falhas; verificar espera limitada, erro controlado e recuperação. |
| NFR-3 | Compra, validação e notificações seguras perante retries/duplicados. | E — B1/B3, pp. 8–9 | Repetir operações, incluindo resposta perdida após commit, e contar efeitos. |
| NFR-4 | Preservar consistência entre componentes; consumo/validação atómicos no Core; ocupação/notificações podem convergir assincronamente. | E — objetivo B3, p. 9; D — mecanismo descrito na secção 8 | Concorrência no último direito e recuperação de eventos. |
| NFR-5 | Medir desempenho com carga/infraestrutura documentadas; metas dependem de decisão. | D — proposta da equipa; Q-08 | Medir latência, throughput e atraso de eventos. |
| NFR-6 | Autorizar no backend, minimizar dados pessoais e proteger segredos. | I/D — proposta da equipa | Acessos entre contas/perfis; ausência de segredos em código/imagens/logs. |
| NFR-7 | Rastrear operações críticas entre pedido, resultado, estado e eventos. | I/D — B1 | Reconstruir compra, validação e alteração operacional. |
| NFR-8 | Evoluir regras/contratos sem alterar retroativamente direitos adquiridos. | D — proposta da equipa | Nova versão não modifica bilhetes existentes. |
| NFR-9 | Observar comportamento para detetar/diagnosticar falhas e validar deployments. | E — B6, p. 3; D — ferramentas propostas na secção 8.3 | Correlacionar operação entre serviços e dependência indisponível. |

As metas de disponibilidade e latência dependem da definição de carga e infraestrutura de referência em Q-08. Não se assume ocupação física exata a partir de entradas apenas.

## 6. Restrições de sistema e engenharia

São obrigações explícitas do projeto completo, identificadas nesta milestone; não se declara a sua implementação concluída.

| ID | Obrigação | Origem | Evidência/prazo |
|---|---|---|---|
| SYS-ARCH-01 | Web, Core e backends de apoio independentes; notificações entre aplicações. | B2, p. 8 | Proposta M1; execução separada até final. |
| SYS-COMM-01 | Comunicação síncrona por APIs e assíncrona/eventos. | B3, pp. 8–9 | Desenho M1; fluxos demonstrados até final. |
| SYS-COMM-02 | Interfaces/dados explícitos; justificar protocolos/formatos. | B2/B3 | Inicial M1; schemas/testes durante desenvolvimento. |
| SYS-COMM-03 | Tratar retries, duplicados, timeouts, falhas e consistência. | B3 | Cenários de recuperação até final. |
| SYS-TEST-01 | Testes unitários, integração, sistema/E2E e aceitação adequada. | B4 | Base M2; completar até final. |
| SYS-TEST-02 | Verificar contratos, interações, falhas, qualidade e análise estática. | B4 | Qualidade básica M2; completar até final. |
| SYS-CI-01 | Build, testes, qualidade básica, contentorização, versão deployável e deployment em desenvolvimento. | B8, p. 4 | Pipeline funcional M2 — 17/11/2026. |
| SYS-CI-02 | CI/CDE/CD completo, artefactos versionados, validação integrada, deployment automático e gates de produção. | B5 | Commit → artefacto → deployment até final. |
| SYS-DEP-01 | Ambientes separados; runner self-hosted e testes de integração/sistema em desenvolvimento. | B6 | Dev para M2; completo final. |
| SYS-DEP-02 | Contentores e infraestrutura/deployment reproduzíveis e versionados. | B6 | Base M2; completo final. |
| SYS-DEP-03 | Estratégia de deployment, segredos, configuração, dados, redes, dependências e recuperação. | B6 | Deployment e rollback validados até final. |
| SYS-OPS-01 | Monitorizar/validar execução e diagnosticar falhas. | B6 | Evidência operacional final. |
| SYS-AI-01 | LLMs/agentes ao longo do ciclo de vida, além de gerar código. | B7 | Evidência desde M1. |
| SYS-AI-02 | Contexto/restrições, validação independente e intervenção humana. | B7 | Contexto e revisões desde M1. |
| SYS-MEAS-01 | Recolher esforço, autonomia, intervenção, falhas, retrabalho, validação e CI/CD. | B7/B8 | Registos desde M1; análise final. |
| SYS-TRACE-01 | Ligar requisitos, decisões, tarefas, verificações, código, artefactos e deployments. | B5/B8 | Origem M1; expandir até final. |
| SYS-REPORT-01 | Relatório do sistema/processo, evidências, métricas e contributos/esforço. | B8 | 11/12/2026. |
| SYS-DEMO-01 | Vídeo de 10 minutos: passageiro, interações, cenários normais/falhas e versão em produção. | B8 | 11/12/2026. |
| SYS-DELIVERY-01 | Código, modelos, scripts, configuração e documentação completos; sistema em produção. | B8 | 11/12/2026. |
| SYS-COURSE-01 | Cinco membros, presenças, auto/heteroavaliação, inscrição atempada na defesa e defesa individual com conhecimento global. | B8 | Calendário académico; inscrição antes da entrega final. |

## 7. Pressupostos e questões em aberto

### 7.1. Base de trabalho

| ID | Pressuposto/decisão | Base/estado | Impacto |
|---|---|---|---|
| A-01 | Consulta pública sem conta; autenticação para compra, carteira e subscrições/preferências. | Proposta da equipa; pressuposto | FR-1 a FR-4/11/19 a FR-23 |
| A-02 | Validador simulado ligado ao sistema; retry da mesma operação, sem aceitação nova offline. | Proposta da equipa; base proposta | FR-13 a FR-15 |
| A-03 | Ocupação é estimativa, não contagem física garantida. | Proposta da equipa; pressuposto | FR-17/18 |
| A-04 | Sem GPS/feed externo obrigatório; pessoal introduz perturbações. | Proposta da equipa; âmbito | FR-6 a FR-9 |
| A-05 | Pagamento simulado sem gateway real. | Decisão de âmbito; gateway real não assumido | FR-11/12 |
| A-06 | Serviço independente entrega notificações; canal por escolher. | B2; proposta da equipa | FR-21/22 |
| A-07 | Perfis base passageiro/pessoal; subperfis operator/admin são proposta a detalhar. | Proposta da equipa; segurança | FR-24; NFR-6 |
| A-08 | Interface em português europeu e dados fictícios. | Proposta da equipa; produto | Interface, testes e privacidade |
| A-09 | Calendários Europe/Lisbon; instantes UTC preservando fuso/calendário na geração de viagens. | Proposta da equipa e refinamento de desenho | Mudanças de hora sem offset fixo |
| A-10 | Base por dia da semana; feriados/exceções com regra explícita. | B1; proposta da equipa; pressuposto | FR-2/3 |

### 7.2. Informação por esclarecer

| ID | Lacuna/ambiguidade | Posição e decisão necessária | Resolver antes de |
|---|---|---|---|
| Q-01 | Conta obrigatória na compra e pagamento real não especificados. | Usar A-01/A-05; confirmar com docente caso haja expectativa diferente. | Fechar compra/conta |
| Q-02 | Catálogo, ativação/expiração, contagem de viagens, transbordos, anti-passback e validação à saída. | Definir catálogo mínimo e exemplos temporais; reembolsos, transferência e suspensão só com decisão explícita. | Implementar regras de títulos |
| Q-03 | Entradas não permitem inferir saídas/ocupação real. | Definir fórmula por viagem/segmento, capacidade, fim da viagem, eventuais correções manuais e níveis públicos; sensores não assumidos. | Implementar ocupação |
| Q-04 | Canais, urgência, quiet hours, retries e significado de entrega. | Selecionar canal demonstrável e política para entrega incerta. | Implementar notificações |
| Q-05 | Sobreposição de perturbações, desvios/cancelamentos parciais. | Precedência cancelamento > desvio/encerramento > atraso é apenas proposta provisória; definir exemplos. | Implementar vista efetiva |
| Q-06 | Hora do cliente, concorrência e repetição legítima. | Distinguir identidade da operação de direito de viajar; definir instante autoritativo/tolerância. | Fechar validação |
| Q-07 | Retenção, eliminação, auditoria e persistência de recusas. | Preservar sucessos/contexto; definir prazos e tratamento de dados pessoais. | Fechar política de dados |
| Q-08 | Sem workload, SLOs ou tolerância a dados desatualizados. | Definir carga/metas; justificar metas com carga e infraestrutura de referência. | Testes de desempenho/aceitação |
| Q-09 | Subperfis e detalhe de auditoria. | Justificar permissões/campos além de passageiro/pessoal. | Implementar autorizações |
| Q-10 | Feriados e transições de hora. | Usar A-09/A-10 e definir viagens em mudanças de hora. | Gerar viagens |
| Q-11 | Afetados, alterações relevantes e subscrições sobrepostas. | Cobrir horários/perturbações; decidir avisos de ocupação/bilhetes e consolidação. | Fechar matching/eventos |

Estas questões podem permanecer abertas na especificação inicial, mas requerem decisão registada antes da implementação afetada. Pressupostos não equivalem a confirmação do docente.

## 8. Arquitetura inicial e decisões

### 8.1. Componentes

Propõem-se três backends para cumprir SYS-ARCH-01 e separar responsabilidades. O Core pode ser modular internamente; validação e notificações são aplicações independentes.

```mermaid
flowchart LR
    U[Passageiro e pessoal] --> W[passenger-web]
    W -->|HTTP JSON| C[core-api]
    W -->|HTTP: subscrições e histórico| N[notification-service]
    V[Validador simulado] -->|HTTP| S[validation-service]
    S -->|HTTP: decisão atómica| C
    C --> CD[(BD Core)]
    S --> VD[(BD Validação)]
    N --> ND[(BD Notificações)]
    C -->|Outbox e eventos| Q[RabbitMQ]
    Q -->|Horários e perturbações| N
    Q -->|Validação aceite: ocupação| C
    N --> A[Adaptador de entrega]
```

| Componente | Responsabilidades e dados sob autoridade | Requisitos |
|---|---|---|
| passenger-web | Consulta, carteira, área do pessoal e preferências; estado de apresentação, sem autoridade de negócio. | Interfaces dos FR |
| core-api | Contas, rede, horários, viagens, perturbações, bilhética, compra, decisão/registo de validação, ocupação e auditoria de domínio. | FR-1 a FR-19/24/25 |
| validation-service | Receção, formato/identidade do cliente, encaminhamento e retries; registos técnicos de receção/correlação, sem saldo autoritativo. | FR-13/15; NFR-2/3 |
| notification-service | Subscrições, preferências, projeções de alvos, seleção de afetados, deduplicação, entrega e histórico. | FR-20 a FR-23/25 |
| RabbitMQ | Transporte persistente com reentrega; não substitui estado de domínio. | SYS-COMM-01/03 |

Cada backend tem deployment e dados próprios. O validation-service não acede à base do Core: avaliação autoritativa, consumo e registo aceite ocorrem numa única operação transacional do Core. Esta decisão preserva a autonomia dos dados de cada serviço e a atomicidade entre consumo e registo da validação. Não existe aceitação nova local quando o Core está indisponível.

### 8.2. Registo inicial de decisões

Estas decisões serão detalhadas em ADRs antes da implementação. Não se afirma que já existam ADRs separados.

| ID | Decisão e justificação | Rastreabilidade |
|---|---|---|
| D-01 | Monorepositório, web e três backends independentes: contratos próximos e deployment separado, com integração explícita. | SYS-ARCH-01 |
| D-02 | REST/HTTP JSON para resposta imediata e RabbitMQ para desacoplar notificações/projeções. | SYS-COMM-01/02 |
| D-03 | Dados privados; autoridade de consumo/validação no Core para evitar transação distribuída no último direito. | FR-14/15; NFR-4 |
| D-04 | Outbox transacional, relay e consumidores idempotentes: recuperação entre commit/publicação sem repetir efeitos. | NFR-3/4 |
| D-05 | Versionar horários/condições e sobrepor perturbações: preservar histórico e direitos adquiridos. | FR-4/25; NFR-8 |
| D-06 | Pagamento/validador simulados: limitar integrações não exigidas mantendo fluxos demonstráveis. | FR-11/13 |
| D-07 | Notificações fora do caminho crítico de consulta/validação: isolamento de falhas. | NFR-1 |
| D-08 | Chaves de idempotência ligadas a payload e restrições únicas: retry devolve original; mesma chave com dados diferentes é conflito. | FR-12/15/22 |

### 8.3. Tecnologias propostas

Propõem-se TypeScript/Node.js, React/Vite, NestJS, PostgreSQL por serviço, RabbitMQ e OpenAPI 3.1: linguagem comum, contratos explícitos e transações. Prisma Migrate ou node-pg-migrate e Zod ou class-validator permanecem por selecionar. Redis só perante necessidade demonstrada.

A entrega prevê Docker/Compose, Traefik, Terraform, GitHub Actions com runner self-hosted, GHCR e blue-green com rollback. A verificação prevê ESLint/Semgrep, Vitest, Supertest/Testcontainers, Pact, Playwright e, conforme risco, k6/Stryker e Trivy/Syft. A operação prevê OpenTelemetry, Prometheus, Loki, Tempo, Grafana, GitHub Secrets e SOPS/age.

São escolhas de desenho. As versões das tecnologias propostas devem ser verificadas quanto a suporte/compatibilidade e fixadas no início da implementação; não se afirma aqui que sejam as versões atuais recomendadas. A equipa deve rever o custo operacional do conjunto de ferramentas.

A equipa considera Kubernetes/k3s, Kafka, múltiplos repositórios e MongoDB desproporcionados ou menos adequados à base transacional. Claude Code, hooks e MCP são propostas de workflow, não configurações comprovadamente operacionais.

## 9. Modelo conceptual e ciclos de vida

Modelo inicial, não esquema físico implementado. Não se exige entidade de frota/tipo de veículo; capacidade pode ser atributo da viagem.

| Grupo / autoridade | Entidades e relações | Ciclo de vida/regras |
|---|---|---|
| Rede / Core | Linha, Variante, Paragem, ParagemDaVariante; sequência de ocorrências ordenadas | Identidade estável e referências históricas. |
| Planeamento / Core | Calendário, VersãoDeHorário, ViagemPlaneada, Passagem; versão gera zero ou mais viagens | Recorrência distinta de execução numa data; passagens ordenadas e versões preservadas. |
| Perturbações / Core | Perturbação, alvos e período | Estados propostos: planeada/ativa/encerrada/expirada; Q-05. |
| Bilhética / Core | Tipo, VersãoDeTipo, Aquisição, Bilhete | Bilhete referencia condições exatas adquiridas; compra pendente/concluída/falhada; título segue Q-02. |
| Validação / Core | Bilhete com zero ou mais ValidaçõesAceites; ResultadoDeOperação liga chave/payload à decisão | Sucessos imutáveis e consumo atómico; resultado de recusa para retries não é histórico analítico permanente. |
| Ocupação / Core | Viagem com zero ou uma EstimativaAtual e, se adotado, zero ou mais RegistosHistóricos | Separar estado atual de snapshots; Q-03/Q-07. |
| Identidade / Core | Conta, PerfilDeAcesso; conta com zero ou mais bilhetes | Autorização backend e referências lógicas noutros serviços. |
| Interação / Notificações | Subscrição, Preferência, Notificação | Subscrição ativa/cancelada; notificação pendente/enviada/falhada; Q-04/Q-11. |
| Integração / cada serviço | Outbox, EventoProcessado | Publicação após commit; efeitos/deduplicação antes de confirmar mensagem. |

Referências entre serviços são lógicas/projeções obtidas por API/eventos, não chaves estrangeiras entre bases. Eventos fornecem alvos suficientes ou enriquecimento explícito para selecionar afetados.

Não se editam validações históricas para corrigir o passado; correções devem ser rastreáveis. A utilização de soft deletion não autoriza apagar/alterar registos que sustentam direitos e auditoria. Retenção física segue Q-07.

## 10. Contratos iniciais

Exemplos propostos, não endpoints existentes. Schemas, autenticação, erros e compatibilidade serão versionados antes do código.

| Interface | Serviço | Operações representativas | Requisitos |
|---|---|---|---|
| Consulta pública | Core | `GET /api/v1/bus-lines`, `GET /api/v1/bus-lines/{id}/stops`, `GET /api/v1/trips/{id}`; horários/perturbações | FR-1 a FR-4/9 |
| Conta/carteira | Core | `POST /api/v1/accounts`, `POST /api/v1/auth/login`, `GET/POST /api/v1/me/tickets` | FR-11/12/19 |
| Operação | Core | Gestão de rede/horários/tipos/perturbações; consulta de validações/ocupação | FR-5 a FR-10/16/18/24 |
| Validação externa | Validação | `POST /api/v1/validations`: bilhete, viagem, paragem e contexto temporal | FR-13 a FR-15 |
| Decisão interna | Core | `POST /api/v1/internal/validation-decisions`, autenticado como serviço | FR-13 a FR-15 |
| Subscrições/preferências | Notificações | `GET/POST /api/v1/me/subscriptions`, cancelamento, preferências e histórico | FR-20 a FR-23 |

Compra/validação usam `Idempotency-Key`, contextualizada por operação/autor e ligada ao payload. A identidade é preservada até ao Core; eventual `eventId` do cliente não constitui segunda identidade contraditória. Eventos publicados têm identidade própria e referência à operação causadora.

Identidade do utilizador vem do token; serviços usam credenciais distintas. Consultas públicas são explicitamente marcadas como tal, aplicando recusa por omissão às restantes operações e respeitando A-01. Erros seguem Problem Details sem detalhes internos. Dinheiro usa cêntimos/moeda; instantes ISO 8601/UTC e calendários locais A-09.

### 10.1. Eventos propostos

| Evento | Produtor | Consumidor/efeito |
|---|---|---|
| `schedule.published` / `schedule.updated` | Core | Notificações atualiza alvos e seleciona subscritores. |
| `disruption.registered` / `disruption.updated` / `disruption.closed` | Core | Notificações aplica âmbito/preferências. |
| `ticket.validated` | Core após aceitação | Core, módulo de ocupação, atualiza estimativa uma vez. |
| `trip.occupancy_changed` | Core | Projeções/alertas; avisos de ocupação dependem de Q-11. |

Envelope: `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `producer`, `correlationId`, `payload`. Payload identifica entidades, versão de domínio e alvos. Consumidores persistem efeitos e deduplicação atomicamente antes de acknowledgement; versões impedem regressões por eventos antigos.

Deduplicação de notificações distingue evento/destinatário/destino e consolida subscrições sobrepostas quando representam a mesma comunicação (Q-04/Q-11). Restrição única evita duplicados lógicos, não garante entrega externa exatamente uma vez. O adaptador necessita de idempotência ou política de resultado incerto.

## 11. Comportamentos críticos e recuperação

### 11.1. Aquisição

1. Passageiro autenticado escolhe versão de tipo e envia chave estável.
2. Core procura resultado prévio e verifica coincidência do payload.
3. Compra simulada concluída grava aquisição, bilhete e outbox aplicável atomicamente.
4. Retry após resposta perdida devolve o original; compra falhada não emite bilhete.

### 11.2. Validação

1. Cliente envia contexto e chave ao validation-service.
2. Serviço encaminha ao Core com timeout e identidade preservada.
3. Core recupera resultado existente ou avalia regras com controlo de concorrência sobre o bilhete.
4. Aceitação grava validação, consumo aplicável, resultado e outbox na mesma transação. Recusa devolve motivo e conserva o resultado necessário a retries conforme política definida.
5. Resposta perdida conduz à repetição da mesma operação. Duas operações distintas concorrem segundo os direitos do título; não se proíbe genericamente uma segunda validação legítima.
6. Evento aceite atualiza ocupação assincronamente; recusa não incrementa ocupação.

### 11.3. Perturbação e notificação

1. Pessoal altera perturbação; Core grava estado/outbox atomicamente e reflete a situação efetiva nas consultas.
2. Serviço independente consome evento, resolve alvos/subscrições e aplica preferências.
3. Cria notificações deduplicadas e entrega por adaptador com retries limitados.
4. Regista resultado e conserva falhas persistentes para diagnóstico/recuperação.

### 11.4. Modos de falha

| Falha | Resultado esperado |
|---|---|
| Notificações indisponíveis | Consulta/validação independentes continuam; pendentes recuperam depois. Subscrições podem ficar indisponíveis. |
| Broker/relay indisponível | Outbox conserva eventos; ocupação/notificações podem atrasar; recuperar sem perda de eventos confirmados. |
| Resposta perdida | Mesma chave recupera resultado sem efeito adicional. |
| Core indisponível na validação | Sem aceitação nova local; erro temporário e reconciliação de resultados incertos com a mesma chave. |
| Consumidor de ocupação parado | Validação aceite mantém-se; estimativa sinaliza desatualização quando necessário e converge após recuperação. |
| Evento duplicado/fora de ordem | Identidade/versão impedem efeitos repetidos e regressão de projeções. |
| Entrega externa incerta | Aplicar Q-04; não declarar garantia exatamente uma vez sem mecanismo correspondente. |
| Deployment falhado | Bloquear promoção e recuperar versão anterior segundo procedimento a implementar/testar. |

Chamadas síncronas têm timeout, retries limitados apenas quando seguros e isolamento por circuit breaker. Limites concretos dependem de Q-08.

## 12. Plano inicial de verificação

Cenários previstos, sem resultados de execução declarados nesta entrega documental.

| Cenário | Requisitos | Verificação prevista |
|---|---|---|
| V-01 — Rede e horários | FR-1 a FR-3; A-09/A-10 | Unidade de calendários e E2E com dados conhecidos. |
| V-02 — Perturbações | FR-4 a FR-9 | Integração/E2E de criação/atualização/fim; sobreposição após Q-05. |
| V-03 — Compra repetida | FR-11/12; NFR-3 | Timeout após persistência e um único bilhete. |
| V-04 — Validade/direitos | FR-10/13/14; Q-02/Q-06 | Fronteiras temporais, estados e persistência. |
| V-05 — Retry/concorrência | FR-14/15; NFR-4 | Dois clientes disputam último direito; contar consumos/resultados duráveis. |
| V-06 — Ocupação/reentrega | FR-17/18; NFR-3 | Broker real, replay e fórmula aprovada sem duplicação. |
| V-07 — Afetados/preferências | FR-20 a FR-23 | Afetados/não afetados e subscrições sobrepostas. |
| V-08 — Falha/recuperação | NFR-1/2; SYS-COMM-03 | Notificações paradas, outras funções disponíveis e recuperação dos pendentes. |
| V-09 — Acessos/histórico | FR-16/19/24/25; NFR-6/7/8 | Perfis/contas, consultas operacionais, versões e reconstrução histórica. |
| V-10 — Contratos | SYS-COMM-02; SYS-TEST-02 | Schemas, compatibilidade e interações entre aplicações independentes. |
| V-11 — Entrega | SYS-CI-01/02; SYS-DEP-01 a SYS-DEP-03 | Build/testes/qualidade, imagens versionadas, deployment e rollback. |
| V-12 — Desempenho/observabilidade | NFR-5/9; Q-08 | Carga documentada, latência e correlação de falhas. |

Integrações usam PostgreSQL/RabbitMQ reais quando a garantia depende de transações/entrega. A estratégia abrange unidade, integração, contratos, sistema/E2E e aceitação, com análise estática e técnicas adicionais de segurança, desempenho ou mutação conforme risco. Uma simulação por LLM não substitui testes executados. A cobertura será expandida quando regras e contratos forem fechados.

## 13. Utilização de IA e evidências

### 13.1. Contributo e limites da evidência

Foi utilizada assistência de IA na estruturação dos requisitos, análise de ambiguidades, revisão de rastreabilidade e preparação da arquitetura inicial. Esta consolidação foi produzida com assistência de Codex.

O contributo está refletido nos requisitos, pressupostos, decisões e cenários apresentados neste documento. Para comprovar o processo, a equipa deve incluir na entrega registos relevantes de sessões e revisões, com ferramenta/modelo quando conhecidos, contexto, resultado e validação humana. Esses registos não estão incluídos nesta especificação. Não se atribuem modelos, horas, aprovações ou testes executados sem evidência.

### 13.2. Refinamentos incorporados

| Aspeto analisado | Tratamento nesta versão |
|---|---|
| Monólito incompatível com distribuição | Serviços independentes e fronteira de notificações na secção 8. |
| Metas numéricas sem origem | Retiradas da base obrigatória; Q-08. |
| Pagamento externo assumido obrigatório | Simulação definida em A-05/D-06. |
| Regras detalhadas de títulos não confirmadas | Requisitos gerais e questões Q-02/Q-06. |
| Bases privadas versus atomicidade | Autoridade transacional no Core, sem acesso cruzado. |
| Tipo de veículo indefinido e snapshots ambíguos | Sem frota obrigatória; estado atual/histórico separados. |
| Recusas confundidas com validações obrigatórias | Sucessos separados de resultados idempotentes e eventual histórico de recusas. |
| Restrições de engenharia omitidas | Registo SYS e plano V-01 a V-12. |
| Deduplicação confundida com entrega garantida | Separar notificação lógica e efeito externo; Q-04/Q-11. |

A tabela explicita o tratamento documental destes aspetos; não declara resultados de execução de software.

### 13.3. Validação humana e recolha futura

Antes da avaliação, a equipa deve rever B1–B8, confirmar/contestar pressupostos e decisões e registar responsável, data e resultado. Esta especificação não declara essa aprovação concluída.

Cada atividade deve guardar identificador/data, requisito/tarefa, ferramenta/modelo quando conhecidos, contexto/prompt ou referência de sessão, resultado/commit, verificações, falhas, intervenção humana e esforço/retrabalho medidos. Informação desconhecida consta como não registada. Métricas de engenharia são distintas das métricas operacionais do produto.

Como processo de supervisão proposto, os resultados de agentes são sujeitos a validação; merges dependem dos checks previstos; alterações a testes exigem justificação e aprovação humana; decisões arquiteturais são registadas antes de implementar; duas falhas na mesma tarefa conduzem a intervenção humana e registo. Este processo planeado não é apresentado como infraestrutura já operacional.

## 14. Correspondência com a milestone 1

| Critério mínimo, enunciado p. 4 | Localização | Estado documental |
|---|---|---|
| Requisitos funcionais/não funcionais | Secções 4–6 | Identificados, classificados e ligados à origem. |
| Ambiguidades, inconsistências, lacunas e pressupostos | Secções 7–8 e 13 | Registados; regras em aberto explícitas. |
| Rastreabilidade ao enunciado | Fontes B1–B8 e tabelas 4–6 | Origem/aceitação previstas; sem implementação ou testes executados associados. |
| Componentes/responsabilidades | Secções 8–10 | Proposta distribuída e interfaces iniciais. |
| IA na análise/refinamento/validação | Secção 13 | Contributo declarado; registos de sessões e aprovação humana por anexar. |
| Explicar/justificar resultado | Secções 7–8 | Depende da revisão e compreensão de todos os membros. |
