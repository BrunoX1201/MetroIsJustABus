# Rascunho histórico — substituído

Esta versão de trabalho não deve ser usada para avaliação nem implementação. A especificação atual é [Requirements.md](Requirements.md), também disponível em [PDF](Requirements.pdf).

# MetroIsJustABus — Especificação de requisitos e arquitetura inicial

**Membros do grupo:**
- Bruno Sampaio — [Inserir N.º]
- David Gregório — [Inserir N.º]
- Gonçalo Silva — [Inserir N.º]
- João Santos — 2021217215
- Miguel [Inserir Apelido] — [Inserir N.º]

**Unidade curricular:** Automated Software Engineering, 2026/2027  
**Entrega:** Milestone 1 — Requirements, 27 de outubro de 2026 (5%)  
**Referência:** enunciado v1.0 de 29 de setembro de 2026

## 1. Objetivo e âmbito
O MetroIsJustABus suporta uma rede urbana de autocarros e os serviços dos seus passageiros: consulta da rede, horários e viagens, aquisição e validação de bilhetes, ocupação, perturbações, subscrições e notificações. O pessoal operacional mantém a informação e consulta a atividade do sistema.

## 2. Fontes e classificação
| Código | Fonte | Conteúdo relevante |
|---|---|---|
| B1 | Enunciado, pp. 7–8 | Domínio, funcionalidades, histórico e falhas |
| B2 | Enunciado, p. 8 | Web, Core e serviços independentes; notificações |
| B3 | Enunciado, pp. 8–9 | APIs/eventos, contratos, falhas e consistência |
| B4 | Enunciado, p. 9; fases, p. 3 | Testes, aceitação, interfaces e análise estática |
| B5 | Enunciado, p. 9 | Pipeline, artefactos, deployment e rastreabilidade |
| B6 | Enunciado, pp. 9–10; p. 3 | Ambientes, contentores e observabilidade |
| B7 | Enunciado, pp. 1–3 e 10 | IA, validação, intervenção humana e métricas |
| B8 | Enunciado, pp. 4–6; p. 2 | Entregas, prazos, avaliação e organização |

**Classificação:** E — explícito no enunciado; I — inferência; A — pressuposto provisório; D — decisão de desenho/âmbito.

## 3. Intervenientes
| Interveniente | Necessidades/responsabilidades |
|---|---|
| Passageiro | Consultar rede, adquirir bilhetes, gerir conta/notificações |
| Pessoal | Manter rede/bilhética/perturbações; consultar métricas |
| Validador | Submeter tentativa e receber decisão (simulado) |
| Equipa | Desenvolver, verificar, operar; supervisionar IA |
| Docente | Esclarecer ambiguidades e avaliar sistema |

## 4. Requisitos funcionais e rastreabilidade

### 4.1. Consulta, Rede e Operação
| ID | Requisito | Resp. | Aceitação prevista |
|---|---|---|---|
| FR-1 | Consultar linhas e sequência de paragens. | Web/Core | Ordem coincide com a linha. |
| FR-2 | Consultar horários por dia e variante. | Web/Core | Dias apresentam variante certa. |
| FR-3 | Consultar viagens e horas previstas. | Web/Core | Viagem tem horas ordenadas. |
| FR-4 | Apresentar alterações conhecidas. | Web/Core | Mostra plano original e alteração. |
| FR-5 | Manter rede, horários e viagens. | Web/Core | Preserva contexto histórico. |
| FR-6 | Registar perturbações (atrasos, desvios). | Web/Core | Identifica tipo e efeito. |
| FR-7 | Identificar âmbito das perturbações. | Web/Core | Atualiza alvos e tempos. |
| FR-8 | Comunicar efeito da perturbação. | Core | Desfasamento ou serviço afetado explícito. |
| FR-9 | Refletir perturbações nas consultas. | Web/Core | Consulta reflete estado vigente. |

### 4.2. Bilhética, Ocupação e Contas
| ID | Requisito | Resp. | Aceitação prevista |
|---|---|---|---|
| FR-10 | Suportar tipos de bilhete distintos. | Core | Regras diferentes aprovadas (Q-02). |
| FR-11 | Adquirir e consultar bilhetes na conta. | Web/Core | Compra disponibiliza título na conta. |
| FR-12 | Retry de compra não duplica bilhetes. | Core | Devolve aquisição original. |
| FR-13 | Avaliar estado antes de validar. | Validação/Core | Aceita/recusa com motivo claro. |
| FR-14 | Registar e consumir títulos. | Core | Registo/consumo na mesma transação. |
| FR-15 | Retry de validação não duplica registo. | Val/Core | Resultado original mantido. |
| FR-16 | Consultar histórico de bilhética pelo pessoal. | Web/Core | Relaciona validação com bilhete. |
| FR-17 | Acompanhar ocupação por validações. | Core | Retry não incrementa nova entrada. |
| FR-18 | Mostrar ocupação ao público e pessoal. | Web/Core | Filtra dados conforme perfil (Q-03). |
| FR-19 | Criar conta e autenticar acessos. | Web/Core | Impede acesso a bilhetes de terceiros. |

### 4.3. Notificações e Auditoria
| ID | Requisito | Resp. | Aceitação prevista |
|---|---|---|---|
| FR-20 | Subscrever informações de rotas. | Notif/Web | Liga passageiro ao alvo. |
| FR-21 | Gerir preferências de notificação. | Notif/Web | Alteração afeta envios futuros. |
| FR-22 | Notificar afetados sem duplicados. | Core/Notif | Reentrega não duplica comunicação. |
| FR-24 | Registar autoria de operações. | Backends | Bloqueia ações não autorizadas e regista autor. |
| FR-25 | Preservar histórico de atividade. | Core/Notif | Mudanças não apagam o passado. |

*(Nota: O histórico pessoal de notificações [FR-23 original] foi removido do âmbito prioritário para esta milestone).*

## 5. Requisitos não funcionais
| ID | Requisito | Verificação prevista |
|---|---|---|
| NFR-1 | Falha de notificações não bloqueia core. | Operações mantêm-se sem serviço de notificação. |
| NFR-2 | Tratar timeouts sem cascatas de erro. | Injetar falhas e atestar recuperação. |
| NFR-3 | Operações seguras perante duplicados. | Repetir envio de mensagens e contar efeitos. |
| NFR-4 | Consumo atómico; projeções assíncronas. | Concorrência no último uso de um bilhete. |
| NFR-6 | Minimizar dados e não expor segredos. | Acessos restritos; zero credenciais no código. |
| NFR-7 | Rastreabilidade de transações críticas. | Reconstruir fluxo completo de compra e validação. |
| NFR-8 | Não retroatividade de regras de bilhetes. | Mudança de preço/regra não altera bilhetes antigos. |
| NFR-9 | Observabilidade de deployments. | Correlacionar falhas entre microsserviços. |

*(O planeamento de desempenho e latências, inicialmente NFR-5, transitou para a secção 7.2 como Q-08 a aguardar definição).*

## 6. Restrições de sistema (Milestone 1)
Obrigações fundamentais focadas no desenho e estrutura exigida para a fase atual. Os detalhes de CI/CD e infraestrutura de produção transitam para anexos ou trabalho futuro.

| ID | Obrigação | Evidência/prazo |
|---|---|---|
| SYS-ARCH-01 | Web, Core e Notificações independentes. | Desenho proposto nesta M1. |
| SYS-COMM-01 | Comunicação síncrona (API) e assíncrona. | Fluxos desenhados nesta M1. |
| SYS-TEST-01 | Estruturação de testes a vários níveis. | Base para M2. |
| SYS-AI-01 | Documentar supervisão de IA e métricas. | Evidência apresentada na Secção 12. |

## 7. Pressupostos e questões em aberto

### 7.1. Base de trabalho
- **A-01:** Consulta livre; autenticação exigida para compras e assinaturas.
- **A-02/A-05:** Validador e gateway de pagamento assumidos como abstrações simuladas online.
- **A-03:** Ocupação é calculada por estimativa e não garantia de sensores físicos.
- **A-04:** Pessoal operacional regista manualmente as perturbações da rede.
- **A-08/A-09:** Interface em Português; sistema usa fuso Europe/Lisbon para geração de viagens diárias.

### 7.2. Informação por esclarecer (Questões Abertas)
- **Q-02 (Bilhética):** Necessidade de fechar catálogo de testes e regras exatas de limite temporal/viagens.
- **Q-03 (Ocupação):** Precisamos definir a fórmula exata de decréscimo ao longo do percurso.
- **Q-05 (Perturbações):** Falta testar cenário de sobreposição (ex: linha desviada que depois é cancelada).
- **Q-08 (Desempenho):** Falta acordar *workload* realista para definir testes de carga e requisitos numéricos de latência/throughput.

## 8. Arquitetura inicial e decisões
Propõem-se três backends principais e uma aplicação web. A separação do `notification-service` protege o caminho crítico de validação e consulta.

![Figura 1: Arquitetura inicial proposta](ADS_architecture-000.png)

### Decisões Arquiteturais Base
- **D-01/D-07:** Três backends independentes. Notificações estão fora do caminho crítico.
- **D-02/D-04:** APIs REST para sincronismo; RabbitMQ e padrão *Outbox* para processamento assíncrono e tolerância a falhas.
- **D-03:** Autoridade transacional unificada no Core para o consumo de bilhetes, evitando transações distribuídas no último direito.
- **D-08:** Uso de `Idempotency-Key` atrelada à *payload* de compras e validações.

## 9. Modelo conceptual e ciclos de vida
* **Planeamento:** Calendário → Versão de Horário → Viagens. Preserva-se histórico de versões passadas.
* **Bilhética:** Tipo → Aquisição → Bilhete. Compra pode ser pendente, falhada ou concluída.
* **Validação:** Consumo é atómico e anexado permanentemente ao histórico do título associado.
* **Notificações:** A deduplicação verifica destinatário, alvo e conteúdo (evento).

## 10. Contratos e Eventos Resumidos
Nesta fase inicial, os contratos não estão fechados. Os fluxos funcionarão através das seguintes integrações primárias:
* **Endpoints Síncronos Core:** Consultas públicas (linhas, viagens), Autenticação/Carteira (gestão do utilizador e bilhetes) e backoffice operacional.
* **Endpoints Síncronos de Validação:** Serviço de borda recebe a leitura do cartão e repassa ao Core, aguardando a decisão autoritativa da transação atómica.
* **Eventos Assíncronos principais (RabbitMQ):**
    * `schedule.published` / `disruption.registered`: Consumidos pelas Notificações para procurar os subscritores afetados.
    * `ticket.validated`: Consumido internamente para incrementar estimativas de lotação da viatura.

## 11. Comportamentos críticos (Recuperação de Falhas)
1. **Perda de comunicação na validação:** Se a resposta cair após a aprovação no backend, o reenvio da mesma *Idempotency-Key* pelo validador devolve a aprovação anterior sem consumir um novo passe.
2. **RabbitMQ / Notificações indisponíveis:** O padrão *Outbox* no Core guarda os eventos numa tabela relacional. A operação do bilhete é concluída no instante. Quando o broker regressar, os eventos pendentes são processados.
3. **Erros de Transação:** Falhas temporárias a meio da compra inviabilizam a aquisição de imediato, garantindo que nenhum bilhete falso é creditado na conta antes do processamento do pagamento simulado.

## 12. Utilização de IA e evidências
Foi utilizada assistência de IA na consolidação dos requisitos em secções tabulares e identificação de ambiguidades. **Para além da síntese abaixo, os registos completos das prompts originais, das revisões manuais efetuadas pela equipa e dos logs das decisões técnicas encontram-se num documento anexo no repositório para verificação docente.**

| ID | Atividade assistida | Evidência e Intervenção Humana | Resultado nesta especificação |
|---|---|---|---|
| AI-01 | Estruturação de requisitos | Proposta inicial sugeria texto corrido para idempotência. A equipa extraiu e transformou em teste funcional específico. | NFR-3 assegura a proteção contra retries de resposta perdida. |
| AI-02 | Revisão da arquitetura | IA apontou o risco de manter notificações no core monolítico. A equipa validou e separou o contexto. | Adotada a fronteira `notification-service` na Secção 8. |
| AI-03 | Deteção de métricas falsas | Geração de texto incluiu "p95 < 300ms". A equipa rejeitou e moveu para análise posterior devido a falta de dados base. | Transformado na Questão em Aberto Q-08. |
| AI-04 | Avaliação de falhas | Sugestão de que os validadores gerassem os seus dados offline. A equipa interveio para garantir regras de negócio centralizadas. | Restrição A-02 e Secção 11 focam a autoridade transacional puramente no Core. |
