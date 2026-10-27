# MetroIsJustABus — Especificação de requisitos e arquitetura inicial

**Membros do grupo:**
- Bruno Sampaio — N.º de estudante
- David Gregório — N.º de estudante
- Gonçalo Silva — N.º de estudante
- João Santos — 2021217215
- Miguel — N.º de estudante

**Unidade curricular:** Automated Software Engineering, 2026/2027  
**Entrega:** Milestone 1 — Requirements, 27 de outubro de 2026 (5%)  
**Referência:** enunciado v1.0 de 29 de setembro de 2026

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

**Classificação:** E — explícito no enunciado; I — inferência; A — pressuposto provisório; D — decisão de desenho/âmbito.

Referenciar o enunciado não lhe atribui os mecanismos técnicos propostos. Os IDs FR-1 a FR-25 e NFR-1 a NFR-9 identificam os requisitos desta especificação. As propostas da equipa são justificadas neste documento. A ligação a implementação e testes executados será acrescentada quando existirem.

## 3. Intervenientes

| Interveniente | Necessidades/responsabilidades |
|---|---|
| Passageiro | Consultar rede/operação, adquirir e consultar bilhetes, consultar capacidade quando apropriado, gerir conta/subscrições/preferências |
| Pessoal operacional | Manter rede/horários/bilhética/perturbações; consultar utilização, validações e ocupação |
| Cliente de validação | Submeter tentativa e receber decisão; abstração de desenho simulada |
| Equipa | Desenvolver, verificar, entregar e operar; supervisionar IA e recolher evidência |
| Docente | Esclarecer ambiguidades e avaliar sistema/processo |

## 4. Requisitos funcionais e rastreabilidade

Os critérios são verificações futuras, não resultados obtidos. Web designa a aplicação; Core, Validação e Notificações são os backends da secção 8.

### 4.1. Consulta Rede e Operação
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

### 4.2. Bilhética, Ocupação e Contas
| ID | Requisito | Classe/origem | Responsável | Aceitação prevista |
|---|---|---|---|---|
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

### 4.3. Notificações e Auditoria
| ID | Requisito | Classe/origem | Responsável | Aceitação prevista |
|---|---|---|---|---|
| FR-20 | Subscrever informação de linhas, paragens ou viagens. | E — B1, p. 7 | Notificações/Web | Subscrição identifica passageiro e alvo. |
| FR-21 | Controlar subscrições e preferências de notificação. | E — B1, p. 7 | Notificações/Web | Alterar/cancelar modifica seleção futura. |
| FR-22 | Identificar afetados por alterações relevantes e notificá-los sem duplicados em retries. | E — B1, pp. 7–8 | Core/Notificações | Reentrega não cria nova notificação lógica. |
| FR-23 | Autorizar operações de pessoal e registar autor/ação/instante. | I/D — B1, p. 7 | Backends | Passageiro não executa operações reservadas; mudanças rastreáveis. |
| FR-24 | Preservar histórico suficiente para compreender atividade anterior. | I — B1, pp. 7–8 | Core/Notificações | Mudanças não eliminam contexto passado; retenção em Q-07. |

## 5. Requisitos não funcionais

| ID | Requisito | Classe/origem | Verificação prevista |
|---|---|---|---|
| NFR-1 | Falha de notificações não impede consultas de rede/horários nem funções independentes. | E — B1, p. 8 | Parar notificações e executar consultas/validações independentes. |
| NFR-2 | Tratar timeouts, comunicação e indisponibilidade sem cascatas desnecessárias. | E — B1/B3, pp. 8–9 | Injetar falhas; verificar espera limitada, erro controlado e recuperação. |
| NFR-3 | Compra, validação e notificações seguras perante retries/duplicados. | E — B1/B3, pp. 8–9 | Repetir operações, incluindo resposta perdida após commit, e contar efeitos. |
| NFR-4 | Preservar consistência entre componentes; consumo/validação atómicos no Core; ocupação/notificações podem convergir assincronamente. | E — objetivo B3, p. 9; D — mecanismo descrito na secção 8 | Concorrência no último direito e recuperação de eventos. |
| NFR-5 | Autorizar no backend, minimizar dados pessoais e proteger segredos. | I/D — proposta da equipa | Acessos entre contas/perfis; ausência de segredos em código/imagens/logs. |
| NFR-6 | Rastrear operações críticas entre pedido, resultado, estado e eventos. | I/D — B1 | Reconstruir compra, validação e alteração operacional. |
| NFR-7 | Evoluir regras/contratos sem alterar retroativamente direitos adquiridos. | D — proposta da equipa | Nova versão não modifica bilhetes existentes. |
| NFR-8 | Observar comportamento para detetar/diagnosticar falhas e validar deployments. | E — B6, p. 3; D — ferramentas propostas na secção 8.3 | Correlacionar operação entre serviços e dependência indisponível. |

As metas de disponibilidade e latência dependem da definição de carga e infraestrutura de referência em Q-08. Não se assume ocupação física exata a partir de entradas apenas.

## 6. Restrições de sistema

São obrigações explícitas do projeto completo, identificadas nesta milestone; não se declara a sua implementação concluída. As restrições de engenharia são separadas das obrigações académicas de entrega. Os IDs existentes são preservados para manter a rastreabilidade.

### 6.1. Restrições de sistema

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

## 7. Pressupostos e questões em aberto

### 7.1. Base de trabalho

| ID | Pressuposto/decisão | Base/estado | Impacto |
|---|---|---|---|
| A-01 | Consulta pública sem conta; autenticação para compra, carteira e subscrições/preferências. | A — pressuposto provisório | FR-1 a FR-4/11/19 a FR-23 |
| A-02 | Validador simulado ligado ao sistema; retry da mesma operação, sem aceitação nova offline. | D — validador simulado; A — operação online | FR-13 a FR-15 |
| A-03 | Ocupação é estimativa, não contagem física garantida. | A — pressuposto provisório | FR-17/18 |
| A-04 | Sem GPS/feed externo obrigatório; pessoal introduz perturbações. | D — decisão de âmbito proposta | FR-6 a FR-9 |
| A-05 | Pagamento simulado sem gateway real. | D — pagamento simulado; Q-01 | FR-11/12 |
| A-06 | Serviço independente entrega notificações; canal por escolher. | E — fronteira independente: B2; A — canal: Q-04 | FR-21/22 |
| A-07 | Perfis base passageiro/pessoal; subperfis operator/admin são proposta a detalhar. | E — perfis base: B1; D — subperfis: Q-09 | FR-24; NFR-6 |
| A-08 | Interface em português europeu e dados fictícios. | D — idioma e dados de demonstração | Interface, testes e privacidade |
| A-09 | Calendários Europe/Lisbon; instantes UTC preservando fuso/calendário na geração de viagens. | D — convenção temporal proposta | Mudanças de hora sem offset fixo |
| A-10 | Base por dia da semana; feriados/exceções com regra explícita. | E — variação semanal: B1; A — feriados/exceções | FR-2/3 |

### 7.2. Informação por esclarecer

| ID | Lacuna/ambiguidade | Posição e decisão necessária | Resolver antes de / requisitos afetados |
|---|---|---|---|
| Q-01 | Conta obrigatória na compra e pagamento real não especificados. | Usar A-01/A-05; confirmar com docente caso haja expectativa diferente. | Fechar compra/conta; FR-11/12/19 |
| Q-02 | Catálogo, ativação/expiração, contagem de viagens, transbordos, anti-passback e validação à saída. | Definir catálogo mínimo e exemplos temporais; reembolsos, transferência e suspensão só com decisão explícita. | Implementar regras de títulos; FR-10/13/14 |
| Q-03 | Entradas não permitem inferir saídas/ocupação real. | Definir fórmula por viagem/segmento, capacidade, fim da viagem, eventuais correções manuais e níveis públicos; sensores não assumidos. | Implementar ocupação; FR-17/18 |
| Q-04 | Canais, urgência, quiet hours, retries e significado de entrega. | Selecionar canal demonstrável e política para entrega incerta. | Implementar notificações; FR-21/22; NFR-3 |
| Q-05 | Sobreposição de perturbações, desvios/cancelamentos parciais. | Precedência cancelamento > desvio/encerramento > atraso é apenas proposta provisória; definir exemplos. | Implementar vista efetiva; FR-4/6/7/8/9 |
| Q-06 | Hora do cliente, concorrência e repetição legítima. | Distinguir identidade da operação de direito de viajar; definir instante autoritativo/tolerância. | Fechar validação; FR-13/14/15; NFR-4 |
| Q-07 | Retenção, eliminação, auditoria e persistência de recusas. | Preservar sucessos/contexto; definir prazos e tratamento de dados pessoais. | Fechar política de dados; FR-16/23/24/25; NFR-6/7 |
| Q-08 | Sem workload, SLOs ou tolerância a dados desatualizados. | Definir carga/metas; justificar metas com carga e infraestrutura de referência. | Testes de desempenho/aceitação; NFR-2/5/9 |
| Q-09 | Subperfis e detalhe de auditoria. | Justificar permissões/campos além de passageiro/pessoal. | Implementar autorizações; FR-24; NFR-6/7 |
| Q-10 | Feriados e transições de hora. | Usar A-09/A-10 e definir viagens em mudanças de hora. | Gerar viagens; FR-2/3 |
| Q-11 | Afetados, alterações relevantes e subscrições sobrepostas. | Cobrir horários/perturbações; decidir avisos de ocupação/bilhetes e consolidação. | Fechar matching/eventos; FR-20/21/22 |

Estas questões podem permanecer abertas na especificação inicial, mas requerem decisão registada antes da implementação afetada. Pressupostos não equivalem a confirmação do docente.

## 8. Arquitetura inicial e decisões

### 8.1. Componentes

Propõem-se três backends para cumprir SYS-ARCH-01 e separar responsabilidades. O Core pode ser modular internamente; validação e notificações são aplicações independentes.

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

**Envelope:** `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `producer`, `correlationId`, `payload`. Payload identifica entidades, versão de domínio e alvos. Consumidores persistem efeitos e deduplicação atomicamente antes de acknowledgement; versões impedem regressões por eventos antigos.

Deduplicação de notificações distingue evento/destinatário/destino e consolida subscrições sobrepostas quando representam a mesma comunicação (Q-04/Q-11). Restrição única evita duplicados lógicos, não garante entrega externa exatamente uma vez. O adaptador necessita de idempotência ou política de resultado incerto.

## 11. Comportamentos críticos e recuperação

Os fluxos seguintes são propostas iniciais para satisfazer os requisitos e serão refinados com as decisões Q-01 a Q-11 e os contratos. Não descrevem implementação já existente.

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

## 12. Utilização de IA e evidências

### 12.1. Registo da assistência de IA

Foi utilizada assistência de IA na estruturação dos requisitos, análise de ambiguidades, revisão de rastreabilidade e preparação da arquitetura inicial. Esta consolidação foi produzida com assistência de Codex.

As evidências abaixo são incorporadas nesta especificação para que a sua leitura não dependa do acesso aos materiais internos de preparação. Os excertos iniciais são transcrições desses materiais; a síntese da revisão e o resultado adotado permitem observar o contributo e os limites da assistência.

| ID | Atividade assistida | Evidência incorporada | Resultado nesta especificação |
|---|---|---|---|
| AI-01 | Estruturação inicial dos requisitos | A proposta inicial organizou requisitos funcionais FR-1 a FR-24 e não funcionais NFR-1 a NFR-8. Exemplo: “Purchase is idempotent, so a retried request cannot issue two tickets.” | FR-12 mantém a proteção contra emissão duplicada. |
| AI-02 | Revisão crítica da arquitetura | A revisão de IA, datada de 10/10/2026 no próprio registo, identificou um conflito na possibilidade de começar com um único backend e separar serviços mais tarde. Recomendou uma fronteira independente para notificações. | Secção 8 e D-01/D-07: três backends independentes e notificações fora do caminho crítico de consulta/validação. |
| AI-03 | Deteção de metas sem fundamento | A proposta inicial incluía disponibilidade de 99,9%, p95 inferior a 300 ms na validação e 200 ms nas consultas. A revisão assinalou que esses valores não estavam fundamentados no enunciado. | NFR-5 e Q-08: metas dependentes de carga e infraestrutura de referência, sem compromissos numéricos assumidos. |
| AI-04 | Identificação de pressupostos de âmbito | Excerto inicial: “Payment is delegated to an external provider.” A revisão distinguiu aquisição de bilhetes de integração obrigatória com um prestador de pagamentos. | A-05 e D-06: pagamento simulado; Q-01 mantém explícita a necessidade de esclarecer expectativas diferentes. |
| AI-05 | Análise de falhas e consistência | Excerto inicial sobre validadores: “They may retry and may be briefly offline.” A revisão distinguiu a repetição de uma operação de uma nova aceitação offline, que poderia consumir o mesmo direito em dispositivos diferentes. | A-02, FR-15 e secção 11.2: identidade estável para retries, decisão autoritativa no Core e ausência de nova aceitação offline. |

<!--## 12. Utilização de IA e evidências

### 12.1. Registo da assistência de IA

Foi utilizada assistência de IA (Codex/ChatGPT) na estruturação dos requisitos, análise de ambiguidades, revisão de rastreabilidade e preparação da arquitetura inicial. 

**Para garantir a verificabilidade exigida (SYS-AI-01 e SYS-AI-02), os registos completos das prompts utilizadas, as respostas em bruto geradas pela IA, a revisão crítica humana efetuada e as decisões finais adotadas estão documentados no repositório do projeto, na diretoria `/docs/ai_evidence/`.**

As evidências sintetizadas na tabela abaixo ilustram o processo de validação independente e a intervenção da equipa, não substituindo a consulta dos logs integrais para auditoria:

| ID | Atividade assistida | Evidência em bruto e Revisão Humana | Resultado nesta especificação |
|---|---|---|---|
| AI-01 | Estruturação de requisitos | **Geração:** A IA sugeriu texto corrido para idempotência ("Purchase is idempotent, so a retried request cannot issue two tickets").<br>**Intervenção:** A equipa avaliou e transformou o texto num teste não-funcional específico.<br>**Registo:** `Log_AI_01_Reqs.md` | FR-12 mantém a proteção contra emissão duplicada; a diretriz **NFR-3** assegura a sua verificação perante resposta perdida. |
| AI-02 | Revisão da arquitetura | **Geração:** A IA identificou o risco de manter o sistema de notificações no core monolítico.<br>**Intervenção:** A equipa discutiu os trade-offs de complexidade e validou a separação para isolar falhas.<br>**Registo:** `Log_AI_02_Arch.md` | Adotada a fronteira independente `notification-service` na Secção 8 (Decisões D-01 e D-07). |
| AI-03 | Deteção de métricas de SLO | **Geração:** A IA alucinou metas específicas no documento, sugerindo "disponibilidade de 99,9% e p95 < 300ms".<br>**Intervenção:** A equipa rejeitou estas metas por não estarem fundamentadas no enunciado, carecendo de um contexto de carga real.<br>**Registo:** `Log_AI_03_Metrics.md` | O requisito numérico foi removido e transformado na Questão em Aberto **Q-08**, aguardando definição de workload. |
| AI-04 | Pressupostos de âmbito | **Geração:** A IA assumiu a integração com uma gateway externa ("Payment is delegated to an external provider").<br>**Intervenção:** A equipa restringiu o âmbito para manter os fluxos demonstráveis sem dependências externas complexas.<br>**Registo:** `Log_AI_04_Scope.md` | **A-05** e **D-06** determinam que o pagamento é apenas simulado; **Q-01** regista a necessidade de validar esta abordagem com o docente. |
| AI-05 | Análise de concorrência e falhas | **Geração:** A IA sugeriu que os validadores gerassem aprovações offline temporárias ("They may retry and may be briefly offline").<br>**Intervenção:** A equipa rejeitou a aprovação offline local para garantir a centralização da regra de negócio atómica (evitar dupla utilização do mesmo bilhete).<br>**Registo:** `Log_AI_05_Failures.md` | **A-02**, **FR-15** e fluxos da secção 11.2 forçam a validação transacional autoritativa exclusivamente no Core. |-->