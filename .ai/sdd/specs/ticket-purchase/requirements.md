# Requisitos — Aquisição de bilhetes (`ticket-purchase`)

**Estado:** rascunho revisto (PL6), 2026-11-24. Serve de base a `design.md`, `tasks.md` e à implementação no PL7.
**Fonte autoritativa:** enunciado v1.1 (`Automated_Software_Development_Project_Complete.v1.1.pdf`), secção *Technical Description – MetroIsJustABus* (pp. 7–8) e *Communication and Integration* (pp. 8–9).
**Contexto do projeto:** `Documentation/Requirements.md` (IDs FR/NFR/A/Q/D) e `.ai/steering/*.md`.

Classificação usada em cada requisito, igual à de `Documentation/Requirements.md`:

- **E** — explícito no enunciado;
- **I** — inferência;
- **A** — pressuposto já registado no projeto;
- **D** — decisão de desenho já registada no projeto;
- **FD** — decisão nova desta funcionalidade, tomada pela equipa e justificada na secção 5.

## 1. Descrição da funcionalidade

> Como **passageiro com conta**, quero **consultar os tipos de bilhete à venda, comprar um bilhete de um desses tipos e consultar os bilhetes associados à minha conta**, para poder viajar na rede. Se a ligação falhar a meio e eu repetir o pedido, **não quero ficar com dois bilhetes nem pagar duas vezes**.

### 1.1. Dentro do âmbito

- Consulta pública do catálogo de tipos de bilhete à venda.
- Compra de **um** bilhete de um tipo, por um passageiro autenticado, com pagamento simulado.
- Proteção contra aquisições duplicadas por retry, através de `Idempotency-Key`.
- Consulta, pelo próprio passageiro, da lista e do detalhe dos seus bilhetes.

### 1.2. Fora do âmbito (outras funcionalidades)

| Assunto | Onde fica | Porquê |
|---|---|---|
| Criação de conta, login e emissão de tokens | FR-18 (funcionalidade própria) | Esta funcionalidade depende dela; ver FD-04. |
| Gestão do catálogo pelo pessoal (criar, alterar preço, retirar da venda) | FR-9, parte "gestão operacional" | O catálogo é carregado por migração (FD-03). |
| Validação, ativação, expiração e consumo de viagens | FR-12 a FR-14, Q-02 | O bilhete emitido fica no estado `issued` (FD-02). |
| Reembolso, cancelamento e transferência | Q-02 | Só com decisão explícita. |
| Pagamento real | A-05, D-06 | Não está no âmbito do produto. |
| Eventos (`ticket.purchased`) e notificações | FR-21 | Nenhum consumidor precisa deles agora (ver design §5). |

## 2. Passagens do enunciado que suportam a funcionalidade

| Ref. | Passagem (enunciado v1.1) | Uso |
|---|---|---|
| S-1 | p. 7: "*MetroIsJustABus also supports passenger access to the transport network through different types of tickets.*" | Catálogo de tipos |
| S-2 | p. 7: "*Ticket types may differ in their price, period of validity, conditions of use, or number of permitted journeys.*" | Atributos do tipo |
| S-3 | p. 7: "*Passengers should be able to acquire tickets and consult the tickets associated with their account.*" | Compra e consulta |
| S-4 | p. 7: "*Passengers may create accounts…*" | Conta (dependência FR-18) |
| S-5 | p. 8: "*…handle communication failures without causing unintended effects, such as issuing the same ticket…*" | Idempotência |
| S-6 | p. 9: "*Appropriate handling of retries and duplicate messages or operations*" | Idempotência e concorrência |
| S-7 | p. 8: "*Historical information may be relevant for understanding previous system activity*" | Histórico de aquisições |
| S-8 | p. 7: "*Ticket validity may depend on the type of ticket, its current state…*" | O bilhete tem estado (o modelo de estados fica em Q-02) |

## 3. Atores, entradas, saídas e dependências

| Elemento | Descrição |
|---|---|
| Atores | **Passageiro anónimo**: consulta o catálogo. **Passageiro autenticado**: compra e consulta os seus bilhetes. **Pessoal**: não intervém nesta funcionalidade. |
| Entradas | Identificador do tipo de bilhete; `Idempotency-Key`; identidade do passageiro obtida do token (nunca do corpo do pedido, segundo as convenções). |
| Saídas | Bilhete emitido, com uma cópia (*snapshot*) das condições do tipo; lista e detalhe dos bilhetes do passageiro; erros em formato Problem Details. |
| Componentes | `frontend` → Nginx → `core-api` (módulo `tickets`) → PostgreSQL `metro_core`. Não envolve `validation-service`, `notification-service` nem RabbitMQ. |
| Dependências externas | Token de autenticação (FR-18 ainda não existe; ver FD-04). Não há gateway de pagamento (A-05). |

## 4. Ambiguidades e lacunas identificadas

| ID | Lacuna/ambiguidade | Tratamento |
|---|---|---|
| AMB-1 | "*issuing the same ticket*" (S-5) pode ser lido de duas formas: (a) a mesma **operação** repetida; (b) dois bilhetes do mesmo tipo comprados pelo mesmo passageiro. | FD-05: a deduplicação é feita **por operação** (chave de idempotência). Duas compras distintas do mesmo tipo são legítimas. |
| AMB-2 | O enunciado não diz que estados tem um bilhete, quando é ativado nem quando expira. | Q-02 continua aberta. FD-02: o bilhete nasce `issued`; as transições pertencem à validação. |
| AMB-3 | "*conditions of use*" (S-2) não está definido. | Nesta funcionalidade fica um texto descritivo (`description`) no tipo. As regras executáveis ficam em Q-02. |
| AMB-4 | Não se diz se a compra exige conta. | Resolvido pelo pressuposto A-01 do projeto (sim) e por S-3 ("*associated with their account*"). |
| AMB-5 | Pagamento: real ou simulado? | Resolvido por A-05/D-06: simulado. FD-06 define o comportamento. |
| AMB-6 | Pode comprar-se mais do que um bilhete por operação? | FD-01: um bilhete por aquisição (como em `Requirements.md` §9.1). |
| AMB-7 | Se o preço mudar entre a consulta e a compra, que preço se cobra? | OQ-2, em aberto. Até haver decisão cobra-se o preço vigente no momento da compra (não bloqueia o PL7, porque o catálogo não muda nesta funcionalidade). |
| AMB-8 | Durante quanto tempo se guardam as chaves de idempotência? | OQ-3 (ligada a Q-07). Até haver decisão guardam-se indefinidamente, junto com o registo da aquisição. |
| AMB-9 | Como se autentica o passageiro antes de FR-18 existir? | FD-04, proposta interina; OQ-5. |

## 5. Pressupostos e decisões

### 5.1. Herdados do projeto (não são requisitos do enunciado)

- **A-01**: a consulta é pública; a compra e a carteira exigem autenticação.
- **A-05 / D-06**: o pagamento é simulado.
- **A-08**: dados fictícios e interface em português europeu.
- **D-05 / NFR-7**: o bilhete guarda a versão do tipo que foi adquirida.
- **D-08**: a chave de idempotência fica ligada ao conteúdo do pedido; a mesma chave com dados diferentes é conflito.
- **Princípios 7 e 12**: idempotência obrigatória; dinheiro em cêntimos inteiros.

### 5.2. Decisões desta funcionalidade (team decisions, a confirmar em `review.md`)

| ID | Decisão | Justificação |
|---|---|---|
| FD-01 | Cada aquisição emite exatamente um bilhete. | Simplifica a idempotência e coincide com `Requirements.md` §9.1. |
| FD-02 | Um bilhete acabado de emitir tem `status = "issued"`. Nenhuma outra transição é definida aqui. | Evita inventar o ciclo de vida que Q-02 deixa em aberto. |
| FD-03 | O catálogo inicial é carregado por migração e tem três tipos fictícios, iguais aos do frontend de demonstração: viagem simples (200 cêntimos, 1 viagem), passe diário (550 cêntimos, 24 h), passe mensal (3000 cêntimos, 30 dias). Moeda `EUR`. | A gestão pelo pessoal está fora do âmbito; os dados mantêm-se coerentes com a demo existente. **Os valores são fictícios e não são regras do enunciado.** |
| FD-04 | **Interina:** o `core-api` aceita `Authorization: Bearer <JWT>` assinado com HS256 e um segredo de configuração (`AUTH_JWT_SECRET`). Usa a claim `sub` (UUID do passageiro) e `role = "passenger"`. A emissão de tokens fica fora do âmbito: os testes geram os seus próprios tokens. | Segue as convenções (JWT, `userId` lido do token) sem implementar FR-18. O formato pode mudar quando FR-18 for especificado (OQ-5). |
| FD-05 | A idempotência tem como âmbito o par (passageiro, `Idempotency-Key`). | Dois passageiros com a mesma chave não interferem um com o outro; uma chave não serve para descobrir operações de terceiros. |
| FD-06 | O pagamento simulado é sempre aprovado e não recolhe dados de pagamento. Fica registado o montante, a moeda e `paymentMethod = "simulated"`. | Cumpre A-05. Não se recolhem dados financeiros. |
| FD-07 | Uma repetição bem-sucedida devolve o **mesmo** código (`201`) e o **mesmo** corpo da resposta original, com o cabeçalho `Idempotency-Replayed: true`. | Para o cliente, o resultado é igual ao original; o cabeçalho torna a repetição observável nos testes e nos logs. |
| FD-08 | A chave `Idempotency-Key` tem de ter entre 8 e 128 caracteres de `[A-Za-z0-9_-]`. O frontend gera um UUID por intenção de compra. | Formato verificável e suficiente para UUIDs. |

## 6. Requisitos da funcionalidade

| ID | Requisito | Classe e origem | Prioridade |
|---|---|---|---|
| REQ-TP-01 | O sistema deve permitir a qualquer pessoa, mesmo sem conta, consultar os tipos de bilhete à venda, com nome, descrição das condições, preço (cêntimos + moeda), regra de validade (n.º de viagens ou duração) e versão. | E — S-1, S-2; A-01; FR-9 | Must |
| REQ-TP-02 | Um passageiro autenticado deve poder adquirir um bilhete de um tipo à venda. Cada aquisição concluída emite exatamente um bilhete, associado à conta do passageiro, com pagamento simulado aprovado. | E — S-3; A-01, A-05; FD-01, FD-06; FR-10 | Must |
| REQ-TP-03 | O bilhete emitido deve guardar uma cópia das condições do tipo no momento da compra: versão, nome, preço pago, moeda e regra de validade. Alterações posteriores ao catálogo não o modificam. | D — D-05, NFR-7 | Must |
| REQ-TP-04 | Um pedido de aquisição sem `Idempotency-Key` válida é rejeitado (`400`) sem efeitos. Repetir um pedido com a mesma chave e o mesmo conteúdo, para o mesmo passageiro, devolve o resultado original (FD-07) sem emitir outro bilhete nem registar outro pagamento. | E — S-5, S-6; D-08; FR-11; FD-05, FD-07, FD-08 | Must |
| REQ-TP-05 | A mesma chave usada pelo mesmo passageiro com conteúdo diferente é rejeitada com `409`, sem efeitos. | D — D-08 | Must |
| REQ-TP-06 | Pedidos simultâneos com a mesma chave e o mesmo conteúdo, do mesmo passageiro, resultam em exatamente um bilhete, e todas as respostas bem-sucedidas referem esse bilhete. | E — S-6; NFR-3, NFR-4 | Must |
| REQ-TP-07 | Um passageiro autenticado deve poder consultar a lista e o detalhe dos seus bilhetes. Os bilhetes de outra conta nunca lhe são devolvidos: um pedido de detalhe para um bilhete alheio responde como inexistente (`404`). | E — S-3; I — FR-18 | Must |
| REQ-TP-08 | Pedidos de aquisição inválidos não produzem efeitos: sem token ou com token inválido/expirado → `401`; token válido sem papel `passenger` → `403`; corpo inválido (incluindo campos não previstos, como `passengerId`) → `400`; tipo inexistente ou fora de venda → `422`. | I/D — convenções (códigos de estado, Problem Details) | Must |
| REQ-TP-09 | A aquisição é atómica: o registo da aquisição e a emissão do bilhete ou ficam ambos persistidos, ou nenhum fica. Se a base de dados estiver indisponível, o pedido termina com `503` e `Retry-After`. Uma repetição posterior com a mesma chave conclui a operação no máximo uma vez. | E — S-5; NFR-3, NFR-4; princípio 11 | Must |
| REQ-TP-10 | Cada aquisição fica registada sem eliminação: passageiro, chave, resumo do conteúdo, tipo e versão, montante, moeda, método de pagamento e instante UTC. Os logs da operação incluem os identificadores da aquisição e do bilhete, mas nunca o token nem dados pessoais. | E — S-7; FR-23; NFR-5, NFR-6; princípio 13 | Should |
| REQ-TP-11 | A aplicação web deve permitir ao passageiro autenticado ver o catálogo, comprar e ver a carteira através da API (em vez do estado local da demonstração), reutilizando a mesma chave quando repete uma compra que falhou. | E — S-3; aplicação web para passageiros (p. 8) | Should — **bloqueado por FR-18/OQ-5** |

## 7. Cenários de aceitação

Dados comuns a todos os cenários:

- base de dados com o catálogo FD-03;
- `P1` e `P2` são passageiros com tokens válidos (FD-04);
- `T_single` é o tipo "viagem simples" (versão 1, 200 cêntimos, EUR, 1 viagem).

| ID | Requisito | Dado / Quando / Então |
|---|---|---|
| AC-01 | REQ-TP-01 | **Dado** o catálogo inicial, **quando** um cliente sem token pede `GET /api/v1/ticket-types`, **então** recebe `200` com os 3 tipos à venda, cada um com `priceCents`, `currency = "EUR"`, `validity` e `version`. |
| AC-02 | REQ-TP-02, 03, 07, 10 | **Dado** `P1` sem bilhetes, **quando** `P1` faz `POST /api/v1/ticket-purchases` com a chave `K1` e `{ticketTypeId: T_single}`, **então** recebe `201` com um bilhete: `status = "issued"`, `ticketTypeVersion = 1`, `pricePaidCents = 200`, `currency = "EUR"`, `validity = {kind: "journeys", journeys: 1}` e `purchasedAt` em UTC. **E** `GET /api/v1/me/tickets` de `P1` devolve exatamente esse bilhete. **E** existe exatamente 1 aquisição registada, com `paymentMethod = "simulated"`. |
| AC-03 | REQ-TP-04 | **Dado** que AC-02 foi concluído, **quando** `P1` repete o mesmo pedido com `K1` (simula a perda da resposta), **então** recebe `201`, o mesmo `ticket.id` e o mesmo `purchaseId`, com `Idempotency-Replayed: true`. **E** `P1` continua a ter 1 bilhete e 1 aquisição. |
| AC-04 | REQ-TP-05 | **Dado** que AC-02 foi concluído, **quando** `P1` envia `K1` com outro `ticketTypeId`, **então** recebe `409` (Problem Details, `type` termina em `idempotency-key-reused`). **E** continua com 1 bilhete. |
| AC-05 | REQ-TP-02, FD-05 | **Dado** que AC-02 foi concluído, **quando** `P1` compra de novo `T_single` com uma chave nova `K2`, **então** recebe `201` com outro `ticket.id`. **E** `P1` tem 2 bilhetes. |
| AC-06 | REQ-TP-06 | **Dado** `P1` sem bilhetes, **quando** dois pedidos idênticos com `K3` são enviados ao mesmo tempo, **então** ambos recebem `201` com o mesmo `ticket.id`. **E** `P1` tem exatamente 1 bilhete. |
| AC-07 | REQ-TP-04, 08 | **Quando** `P1` faz o pedido de compra sem `Idempotency-Key`, ou com uma chave de 3 caracteres, **então** recebe `400` e não é criado nenhum bilhete. |
| AC-08 | REQ-TP-08 | **Quando** o pedido de compra é feito sem token, com assinatura inválida ou com token expirado, **então** recebe `401` e não é criado nenhum bilhete. |
| AC-14 | REQ-TP-04 | **Dado** que AC-02 foi concluído e, depois, `T_single` passou a `on_sale = false`, **quando** `P1` repete o pedido com `K1`, **então** recebe `201` com o bilhete original e `Idempotency-Replayed: true` (e não `422`). |
| AC-09 | REQ-TP-08 | **Quando** `P1` compra um `ticketTypeId` inexistente, ou de um tipo com `on_sale = false`, **então** recebe `422` e não é criado nenhum bilhete. |
| AC-10 | REQ-TP-07 | **Dado** que AC-02 foi concluído, **quando** `P2` pede `GET /api/v1/me/tickets`, **então** recebe uma lista vazia. **E** `GET /api/v1/me/tickets/{id do bilhete de P1}` feito por `P2` devolve `404`. |
| AC-11 | REQ-TP-03 | **Dado** que AC-02 foi concluído, **quando** o tipo `T_single` passa para a versão 2 com o preço de 250 cêntimos (alteração feita diretamente na base de dados, pois a gestão do catálogo está fora do âmbito), **então** o bilhete de `P1` continua com `ticketTypeVersion = 1` e `pricePaidCents = 200`. **E** uma compra nova paga 250 cêntimos com a versão 2. |
| AC-12 | REQ-TP-09 | **Dado** que a base de dados está inacessível, **quando** `P1` compra com `K4`, **então** recebe `503` com `Retry-After`. **E**, depois de a base de dados recuperar, **quando** `P1` repete o pedido com `K4`, **então** recebe `201`, sem `Idempotency-Replayed`, e tem exatamente 1 bilhete. |
| AC-13 | REQ-TP-04, FD-05 | **Quando** `P1` e `P2` compram com a mesma chave `K5`, **então** cada um recebe `201` com um bilhete diferente (2 bilhetes no total). |

## 8. Requisitos não funcionais aplicáveis

- Correção acima de desempenho na bilhética (`product.md`). **Não se fixam metas de latência** (Q-08).
- Dinheiro em cêntimos inteiros e instantes em UTC (princípios 12 e 13).
- Autorização feita no backend (princípio 15). O `userId` vem sempre do token.
- Respostas de erro em Problem Details, sem *stack traces* nem nomes de tabelas (convenções).

## 9. Questões em aberto

| ID | Questão | Bloqueia? |
|---|---|---|
| OQ-1 | Ciclo de vida do bilhete: ativação, expiração, consumo (Q-02). | Não bloqueia esta funcionalidade; bloqueia a validação. |
| OQ-2 | Que preço se cobra se o catálogo mudar entre a consulta e a compra? Deve o cliente enviar o preço esperado? | Não (o catálogo não muda nesta funcionalidade). |
| OQ-3 | Durante quanto tempo se guardam as chaves e aquisições (Q-07)? | Não. |
| OQ-4 | Há limite de bilhetes por passageiro? O enunciado não o refere, por isso nada se impõe. | Não. |
| OQ-5 | Formato definitivo da autenticação e emissão de tokens (FR-18). Confirmar se FD-04 se mantém. | Sim: **REQ-TP-11** (frontend) fica bloqueado até haver login. |
