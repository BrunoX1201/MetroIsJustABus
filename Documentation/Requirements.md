# MetroIsJustABus — Especificação de requisitos e arquitetura inicial

**Membros do grupo:**
- Bruno Sampaio — 2026193650
- David Gregório — 2023220268
- Gonçalo Silva — 2023215512
- João Santos — 2021217215
- Miguel Pereira — 2026195153

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

Referenciar o enunciado não lhe atribui os mecanismos técnicos propostos. Os requisitos funcionais e não funcionais identificados abaixo pertencem a esta especificação. As propostas da equipa são justificadas neste documento. A ligação a código e testes executados será acrescentada quando existirem.

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
| FR-8 | Refletir criação, atualização e fim de perturbações nas consultas. | E/I — B1, p. 7 | Web/Core | Consulta posterior apresenta situação vigente. |

### 4.2. Bilhética, Ocupação e Contas
| ID | Requisito | Classe/origem | Responsável | Aceitação prevista |
|---|---|---|---|---|
| FR-9 | Suportar tipos de bilhete distintos em preço, validade, condições ou viagens e permitir gestão operacional. | E — B1, p. 7 | Core | Tipos aplicam regras distintas aprovadas em Q-02. |
| FR-10 | Adquirir bilhetes e consultar os associados à conta. | E — B1, p. 7; conta na compra: A-01 | Web/Core | Aquisição concluída disponibiliza bilhete na conta correta. |
| FR-11 | Retry da mesma aquisição não emite bilhetes adicionais. | E — B1, p. 8 | Core | Repetição devolve aquisição original. |
| FR-12 | Avaliar tipo, estado, validações anteriores e instante antes de aceitar utilização. | E — B1, p. 7 | Validação/Core | Aceitar/recusar segundo regras, com motivo definido no contrato. |
| FR-13 | Registar duravelmente sucessos e atualizar coerentemente os direitos do título. | E/I — B1, p. 7 | Core | Registo e consumo aplicável na mesma transação. |
| FR-14 | Retry da mesma validação não duplica registo nem consumo. | E — B1, p. 8 | Validação/Core | Resultado original sem efeito adicional. |
| FR-15 | Consultar utilização de bilhetes e atividade de validação pelo pessoal. | E — B1, p. 7 | Web/Core | Relacionar registos com bilhete e contexto disponível. |
| FR-16 | Acompanhar ocupação/capacidade considerando atividade dos passageiros, incluindo validações. | E — B1, p. 7 | Core | Aceitação influencia estimativa segundo Q-03; retry não incrementa novamente. |
| FR-17 | Disponibilizar capacidade/ocupação ao pessoal e, quando apropriado, passageiros. | E — B1, p. 7 | Web/Core | Dados adequados ao perfil e política Q-03. |
| FR-18 | Criar conta e autenticar acesso a dados pessoais. | E — criação: B1, p. 7; I — autenticação | Web/Core | Conta autentica-se; não consulta bilhetes privados de outra. |

### 4.3. Notificações e Auditoria
| ID | Requisito | Classe/origem | Responsável | Aceitação prevista |
|---|---|---|---|---|
| FR-19 | Subscrever informação de linhas, paragens ou viagens. | E — B1, p. 7 | Notificações/Web | Subscrição identifica passageiro e alvo. |
| FR-20 | Controlar subscrições e preferências de notificação. | E — B1, p. 7 | Notificações/Web | Alterar/cancelar modifica seleção futura. |
| FR-21 | Identificar afetados por alterações relevantes e notificá-los sem duplicados em retries. | E — B1, pp. 7–8 | Core/Notificações | Reentrega não cria nova notificação lógica. |
| FR-22 | Autorizar operações de pessoal e registar autor/ação/instante. | I/D — B1, p. 7 | Backends | Passageiro não executa operações reservadas; mudanças rastreáveis. |
| FR-23 | Preservar histórico suficiente para compreender atividade anterior. | I — B1, pp. 7–8 | Core/Notificações | Mudanças não eliminam contexto passado; retenção em Q-07. |

## 5. Requisitos não funcionais

| ID | Requisito | Classe/origem | Verificação prevista |
|---|---|---|---|
| NFR-1 | Falha de notificações não impede consultas de rede/horários nem funções independentes. | E — B1, p. 8 | Parar notificações e executar consultas/validações independentes. |
| NFR-2 | Cada chamada síncrona entre backends deve ter um prazo máximo configurado (valor inicial: 3 s). Se o Core não responder a uma validação dentro desse prazo, o `validation-service` termina o pedido com erro de indisponibilidade, sem registar aceitação local nem repetir automaticamente a operação com outra chave. Uma resposta perdida após o Core processar o pedido não permite presumir que o bilhete ficou por consumir; a mesma chave de idempotência recupera a decisão original. Depois de restabelecida a comunicação, um novo pedido válido deve poder ser processado sem reiniciar os serviços. | E — tratamento de falhas: B1/B3, pp. 8–9; D — prazo e política propostos | Em teste com Core impedido de processar o pedido, medir conclusão da chamada em até 3,5 s (margem de 0,5 s), confirmar erro controlado e zero validações aceites; restaurar Core e confirmar sucesso no primeiro novo pedido. Repetir com resposta perdida após commit e verificar FR-14. |
| NFR-3 | Compra, validação e notificações seguras perante retries/duplicados. | E — B1/B3, pp. 8–9 | Repetir operações, incluindo resposta perdida após commit, e contar efeitos. |
| NFR-4 | Preservar consistência entre componentes; consumo/validação atómicos no Core; ocupação/notificações podem convergir assincronamente. | E — objetivo B3, p. 9; D — mecanismo descrito na secção 8 | Concorrência no último direito e recuperação de eventos. |
| NFR-5 | Autorizar no backend, minimizar dados pessoais e proteger segredos. | I/D — proposta da equipa | Acessos entre contas/perfis; ausência de segredos em código/imagens/logs. |
| NFR-6 | Rastrear operações críticas entre pedido, resultado, estado e eventos. | I/D — B1 | Reconstruir compra, validação e alteração operacional. |
| NFR-7 | Evoluir regras/contratos sem alterar retroativamente direitos adquiridos. | D — proposta da equipa | Nova versão não modifica bilhetes existentes. |
| NFR-8 | Observar comportamento para detetar/diagnosticar falhas e validar deployments. | E — B6, p. 3 | Correlacionar operação entre serviços e dependência indisponível. |

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
| A-01 | Consulta pública sem conta; autenticação para compra, carteira e subscrições/preferências. | A — pressuposto provisório | FR-1 a FR-4/10/18 a FR-22 |
| A-02 | Validador simulado ligado ao sistema; retry da mesma operação, sem aceitação nova offline. | D — validador simulado; A — operação online | FR-12 a FR-14 |
| A-03 | Ocupação é estimativa, não contagem física garantida. | A — pressuposto provisório | FR-16/17 |
| A-04 | Sem GPS/feed externo obrigatório; pessoal introduz perturbações. | D — decisão de âmbito proposta | FR-6 a FR-8 |
| A-05 | Pagamento simulado sem gateway real. | D — pagamento simulado; Q-01 | FR-10/11 |
| A-06 | Serviço independente entrega notificações; canal por escolher. | E — fronteira independente: B2; A — canal: Q-04 | FR-20/21 |
| A-07 | Perfis base passageiro/pessoal; subperfis operator/admin são proposta a detalhar. | E — perfis base: B1; D — subperfis: Q-09 | FR-22; NFR-5/6 |
| A-08 | Interface em português europeu e dados fictícios. | D — idioma e dados de demonstração | Interface, testes e privacidade |
| A-09 | Calendários Europe/Lisbon; instantes UTC preservando fuso/calendário na geração de viagens. | D — convenção temporal proposta | Mudanças de hora sem offset fixo |
| A-10 | Base por dia da semana; feriados/exceções com regra explícita. | E — variação semanal: B1; A — feriados/exceções | FR-2/3 |

### 7.2. Informação por esclarecer

| ID | Lacuna/ambiguidade | Posição e decisão necessária | Resolver antes de / requisitos afetados |
|---|---|---|---|
| Q-01 | Conta obrigatória na compra e pagamento real não especificados. | Usar A-01/A-05; confirmar com docente caso haja expectativa diferente. | Fechar compra/conta; FR-10/11/18 |
| Q-02 | Catálogo, ativação/expiração, contagem de viagens, transbordos, anti-passback e validação à saída. | Definir catálogo mínimo e exemplos temporais; reembolsos, transferência e suspensão só com decisão explícita. | Implementar regras de títulos; FR-9/12/13 |
| Q-03 | Entradas não permitem inferir saídas/ocupação real. | Definir fórmula por viagem/segmento, capacidade, fim da viagem, eventuais correções manuais e níveis públicos; sensores não assumidos. | Implementar ocupação; FR-16/17 |
| Q-04 | Canais, urgência, quiet hours, retries e significado de entrega. | Selecionar canal demonstrável e política para entrega incerta. | Implementar notificações; FR-20/21; NFR-3 |
| Q-05 | Sobreposição de perturbações, desvios/cancelamentos parciais. | Precedência cancelamento > desvio/encerramento > atraso é apenas proposta provisória; definir exemplos. | Implementar vista efetiva; FR-4/6/7/8 |
| Q-06 | Hora do cliente, concorrência e repetição legítima. | Distinguir identidade da operação de direito de viajar; definir instante autoritativo/tolerância. | Fechar validação; FR-12/13/14; NFR-4 |
| Q-07 | Retenção, eliminação, auditoria e persistência de recusas. | Preservar sucessos/contexto; definir prazos e tratamento de dados pessoais. | Fechar política de dados; FR-15/22/23; NFR-5/6/7 |
| Q-08 | Sem workload, SLOs ou tolerância a dados desatualizados. | Definir carga/metas; justificar metas com carga e infraestrutura de referência. | Testes de desempenho/aceitação; NFR-2 (prazo de falha), outras metas a definir |
| Q-09 | Subperfis e detalhe de auditoria. | Justificar permissões/campos além de passageiro/pessoal. | Implementar autorizações; FR-22; NFR-5/6 |
| Q-10 | Feriados e transições de hora. | Usar A-09/A-10 e definir viagens em mudanças de hora. | Gerar viagens; FR-2/3 |
| Q-11 | Afetados, alterações relevantes e subscrições sobrepostas. | Cobrir horários/perturbações; decidir avisos de ocupação/bilhetes e consolidação. | Fechar matching/eventos; FR-19/20/21 |
| Q-12 | Medir desempenho com carga/infraestrutura documentadas. | Acordar workload realista para definir testes de carga e requisitos numéricos de latência/throughput. | Testes de desempenho/aceitação; Q-08 |


Estas questões podem permanecer abertas na especificação inicial, mas requerem decisão registada antes da implementação afetada. Pressupostos não equivalem a confirmação do docente.

## 8. Arquitetura inicial e decisões

### 8.1. Componentes

Propõem-se três backends para cumprir SYS-ARCH-01 e separar responsabilidades. O Core pode ser modular internamente; validação e notificações são aplicações independentes.

| Componente | Responsabilidades e dados sob autoridade | Requisitos |
|---|---|---|
| passenger-web | Consulta, carteira, área do pessoal e preferências; estado de apresentação, sem autoridade de negócio. | Interfaces dos FR |
| core-api | Contas, rede, horários, viagens, perturbações, bilhética, compra, decisão/registo de validação, ocupação e auditoria de domínio. | FR-1 a FR-18, FR-22/23 |
| validation-service | Receção, formato/identidade do cliente, encaminhamento e retries; registos técnicos de receção/correlação, sem saldo autoritativo. | FR-12/14; NFR-2/3 |
| notification-service | Subscrições, preferências, projeções de alvos, seleção de afetados, deduplicação, entrega e histórico. | FR-19 a FR-21/23 |
| RabbitMQ | Transporte persistente com reentrega; não substitui estado de domínio. | SYS-COMM-01/03 |

Cada backend tem deployment e dados próprios. O validation-service não acede à base do Core: avaliação autoritativa, consumo e registo aceite ocorrem numa única operação transacional do Core. Esta decisão preserva a autonomia dos dados de cada serviço e a atomicidade entre consumo e registo da validação. Não existe aceitação nova local quando o Core está indisponível.

### 8.2. Razões e alternativas consideradas

As escolhas seguintes são propostas para cumprir o enunciado e os cenários de aceitação, não soluções universalmente superiores. A comparação explicita o benefício procurado e o custo assumido.

| Escolha | Alternativa considerada | Porquê esta escolha | Custo/limite aceite |
|---|---|---|---|
| `core-api`, `validation-service` e `notification-service` implantáveis separadamente (D-01/D-07) | Um único backend modular | A separação cumpre a fronteira independente exigida para notificações; falhas e deploys desse serviço não interrompem consultas. A validação fica numa fronteira própria para simular clientes e testar a comunicação. | Mais contratos, configuração, monitorização e falhas de rede. Um monólito modular seria mais simples para uma equipa pequena, mas não demonstraria a mesma separação de deployment. |
| HTTP/JSON para consultas e decisões de validação (D-02) | Só eventos assíncronos | Consulta e validador precisam de uma resposta imediata e explícita; HTTP oferece semântica de pedido/resposta e testes de contrato diretos. | Acoplamento temporal ao Core: quando este falha, a validação não pode ser aprovada; NFR-2 define o resultado limitado no tempo. |
| RabbitMQ e outbox para mudanças que alimentam notificações/projeções (D-02/D-04) | Chamada HTTP direta do Core às notificações | O Core confirma primeiro o seu estado; o serviço de notificações pode recuperar e processar eventos pendentes sem bloquear a operação de origem. A outbox fecha a janela entre commit e publicação. | Entrega pelo menos uma vez, duplicados e atraso na propagação; consumidores idempotentes e observabilidade são obrigatórios. |
| Autoridade da validação e do consumo na mesma transação do Core (D-03) | Cada validador manter saldo ou coordenação transacional entre serviços | Duas validações concorrentes do último direito não podem ambas ser aceites. Uma única autoridade e transação permitem verificar esse invariante sem protocolo de transação distribuída. | Core torna-se dependência da aceitação de novas validações; a operação offline fica fora do âmbito A-02. |
| Dados privados por backend, com eventos para projeções (D-03) | Base de dados partilhada | Cada serviço pode evoluir o seu esquema e ser implantado separadamente; a origem de cada dado fica definida. | Projeções podem ficar temporariamente desatualizadas e exigem reconciliação. |
| Monorepositório com contratos versionados (D-01) | Repositório por serviço | O âmbito académico e a equipa favorecem revisão conjunta de contratos, testes e deploys mantendo unidades executáveis independentes. | Exige pipeline seletivo e disciplina para não criar dependências internas entre serviços. |

O prazo inicial de 3 s em NFR-2 é uma decisão testável para falha de comunicação, sujeita a revisão após Q-08. Não afirma que as operações normais demorem até 3 s. Os contratos devem propagar a identidade da operação e impedir que retries criem novas compras ou validações.

### 8.3. Registo inicial de decisões

Estas decisões serão detalhadas em ADRs antes da implementação. Não se afirma que já existam ADRs separados.

| ID | Decisão e justificação | Rastreabilidade |
|---|---|---|
| D-01 | Monorepositório, web e três backends independentes: contratos próximos e deployment separado, com integração explícita. | SYS-ARCH-01 |
| D-02 | REST/HTTP JSON para resposta imediata e RabbitMQ para desacoplar notificações/projeções. | SYS-COMM-01/02 |
| D-03 | Dados privados; autoridade de consumo/validação no Core para evitar transação distribuída no último direito. | FR-13/14; NFR-4 |
| D-04 | Outbox transacional, relay e consumidores idempotentes: recuperação entre commit/publicação sem repetir efeitos. | NFR-3/4 |
| D-05 | Versionar horários/condições e sobrepor perturbações: preservar histórico e direitos adquiridos. | FR-4/23; NFR-7 |
| D-06 | Pagamento/validador simulados: limitar integrações não exigidas mantendo fluxos demonstráveis. | FR-10/12 |
| D-07 | Notificações fora do caminho crítico de consulta/validação: isolamento de falhas. | NFR-1 |
| D-08 | Chaves de idempotência ligadas a payload e restrições únicas: retry devolve original; mesma chave com dados diferentes é conflito. | FR-11/14/21 |

## 9. Especificação que orienta a implementação

Esta secção transforma requisitos em comportamento, dados, interfaces e verificações previstas. Os nomes de operações e eventos são contratos propostos para implementação; ainda não são evidência de código executado. Uma alteração de contrato deve atualizar a rastreabilidade e os testes associados.

### 9.1. Fluxos e contratos mínimos

| Fluxo | Entrada e fronteira | Regra/saída observável | Requisitos e decisão | Teste de aceitação previsto |
|---|---|---|---|---|
| Consulta da operação | Web → `core-api`: linha, paragem ou viagem e data | Devolve plano aplicável e perturbações vigentes com efeito; a vista indica o plano original quando alterado. | FR-1 a FR-4/8; D-05 | Publicar atraso, consultar a viagem, encerrar atraso e confirmar que a consulta volta a mostrar a situação vigente sem perder o histórico. |
| Registo de perturbação | Pessoal autorizado → `core-api`: tipo, alvos, intervalo, efeito e identificador da operação | Valida alvo e intervalo; grava alteração e evento na mesma transação; devolve ID/versão da perturbação. | FR-6/7/22/23; D-04/05 | Registar e atualizar uma perturbação; verificar alvo, intervalo, efeito e autoria. |
| Aquisição | Web → `core-api`: conta, tipo de bilhete, dados da compra e chave de idempotência | Reserva/conclui pagamento simulado e emite um título por operação concluída; retry com mesma chave e dados devolve o resultado anterior; mesma chave com dados diferentes é conflito. | FR-9 a FR-11; D-06/08 | Perder resposta após commit e repetir: existe apenas um bilhete. |
| Validação | Cliente → `validation-service` → `core-api`: título, contexto da viagem, instante recebido, chave de idempotência | Core decide aceite/recusado com motivo; se aceite, grava validação e consumo de direito numa transação; retry devolve a mesma decisão. O instante autoritativo e tolerância ficam em Q-06. | FR-12 a FR-14; NFR-2/4; D-03/08 | Duas tentativas concorrentes para o último direito produzem no máximo uma aceitação; retry não consome novamente. |
| Notificação | `core-api` → outbox → RabbitMQ → `notification-service`: ID de evento, versão, tipo, alvos e instante | Serviço seleciona subscritores afetados segundo preferências e cria no máximo uma notificação lógica por evento/destinatário; entrega pode ser repetida sem duplicar o registo. | FR-19 a FR-21; NFR-1/3/4; D-04/07 | Desligar notificações, registar perturbação, restaurar serviço e confirmar entrega única após reentrega do evento. |

Contratos HTTP devem documentar método, caminho, esquema JSON, respostas de sucesso/erro, autenticação, versão e `Idempotency-Key` antes de implementar cada fluxo. Eventos devem documentar esquema, versão, `eventId`, `occurredAt`, origem e política de reentrega. Não se inventam aqui caminhos de URL ou códigos específicos que ainda dependem da escolha de framework e do catálogo de erros.

### 9.2. Modelo e invariantes mínimos

| Entidade/estado | Campos ou regra necessários | Origem |
|---|---|
| Linha, paragem e viagem | Linha tem sequência ordenada de paragens; viagem referencia versão de horário e passagens previstas. | FR-1 a FR-3; D-05 |
| Perturbação | ID, tipo, alvos, início/fim, estado e versão. Atraso inclui desfasamento temporal; cancelamento identifica serviços/passagens anulados; desvio identifica paragens substituídas e percurso alternativo quando definido em Q-05. | FR-4/6/7/8; Q-05 |
| Tipo de bilhete e título | Tipo tem versão de preço/validade/viagens; título guarda a versão adquirida. Alterar o catálogo não muda direitos já emitidos. | FR-9/10; NFR-7 |
| Aquisição | Chave de idempotência única por âmbito, hash dos dados relevantes, resultado e título emitido. | FR-11; D-08 |
| Validação | Chave de idempotência, título, contexto, decisão, motivo e instante; uma decisão aceite e o consumo correspondente são atómicos. | FR-12 a FR-14; NFR-4 |
| Outbox e notificação | Evento persistido com ID único antes da publicação; consumidor regista IDs processados e unicidade por evento/destinatário. | FR-21; NFR-3/4; D-04 |

### 9.3. Rastreabilidade e critérios para avançar

Cada tarefa de implementação deve referenciar os IDs acima e acrescentar, no mesmo pedido de alteração, o código, o contrato versionado e o teste que comprova a regra. Os cenários da tabela 9.1 são critérios de aceitação previstos, não testes já executados. Q-02, Q-03, Q-05 e Q-06 devem ser fechadas antes da respetiva lógica de bilhética, ocupação, perturbações e validação. Q-08 e Q-12 condicionam metas de desempenho adicionais; não impedem o teste de falha delimitada de NFR-2.

## 10. Utilização de IA e evidências

### 10.1. Registo da assistência de IA

Foi utilizada assistência de IA na estruturação dos requisitos, análise de ambiguidades, revisão de rastreabilidade e preparação da arquitetura inicial. Esta consolidação foi produzida com assistência de Codex.

As evidências abaixo são incorporadas nesta especificação para que a sua leitura não dependa do acesso aos materiais internos de preparação. Os excertos iniciais são transcrições desses materiais; a síntese da revisão e o resultado adotado permitem observar o contributo e os limites da assistência.

| ID | Atividade assistida | Evidência incorporada | Resultado nesta especificação |
|---|---|---|---|
| AI-01 | Estruturação inicial dos requisitos | A proposta inicial organizou requisitos funcionais e não funcionais. Exemplo: “Purchase is idempotent, so a retried request cannot issue two tickets.” | FR-11 mantém a proteção contra emissão duplicada. |
| AI-02 | Revisão crítica da arquitetura | A revisão de IA, datada de 10/10/2026 no próprio registo, identificou um conflito na possibilidade de começar com um único backend e separar serviços mais tarde. Recomendou uma fronteira independente para notificações. | Secção 8 e D-01/D-07: três backends independentes e notificações fora do caminho crítico de consulta/validação. |
| AI-03 | Deteção de metas sem fundamento | A proposta inicial incluía disponibilidade de 99,9%, p95 inferior a 300 ms na validação e 200 ms nas consultas. A revisão assinalou que esses valores não estavam fundamentados no enunciado. | Q-08: metas de desempenho dependentes de carga e infraestrutura de referência. O prazo de falha de NFR-2 é uma escolha de desenho para teste de isolamento, não uma meta de latência normal. |
| AI-04 | Identificação de pressupostos de âmbito | Excerto inicial: “Payment is delegated to an external provider.” A revisão distinguiu aquisição de bilhetes de integração obrigatória com um prestador de pagamentos. | A-05 e D-06: pagamento simulado; Q-01 mantém explícita a necessidade de esclarecer expectativas diferentes. |
| AI-05 | Análise de falhas e consistência | Excerto inicial sobre validadores: “They may retry and may be briefly offline.” A revisão distinguiu a repetição de uma operação de uma nova aceitação offline, que poderia consumir o mesmo direito em dispositivos diferentes. | A-02, FR-14 |
