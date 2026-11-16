import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { departures, disruptions, lines, ticketOptions, type Departure, type Line } from './demoData';

type View = 'inicio' | 'linhas' | 'bilhetes' | 'alertas';
type ConnectionState = 'a verificar' | 'ligado' | 'indisponível';

const menu: { id: View; title: string; icon: string }[] = [
  { id: 'inicio', title: 'Visão geral', icon: '◫' },
  { id: 'linhas', title: 'Linhas e horários', icon: '≋' },
  { id: 'bilhetes', title: 'Bilhetes', icon: '▤' },
  { id: 'alertas', title: 'Alertas', icon: '◉' },
];

function LineBadge({ line, small = false }: { line: Line; small?: boolean }) {
  return <span className={small ? 'line-badge small' : 'line-badge'} style={{ '--line-color': line.color } as CSSProperties}>{line.number}</span>;
}

function Occupancy({ level }: { level: Departure['occupancy'] }) {
  const labels = { low: 'Muitos lugares', medium: 'Lugares disponíveis', high: 'Quase cheio' };
  return <span className={`occupancy ${level}`}><i />{labels[level]}</span>;
}

export default function App() {
  const [view, setView] = useState<View>('inicio');
  const [selectedLine, setSelectedLine] = useState('todas');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['7', '12']);
  const [subscriptions, setSubscriptions] = useState<string[]>(['7']);
  const [ownedTickets, setOwnedTickets] = useState<string[]>(['single']);
  const [notice, setNotice] = useState('');
  const [coreState, setCoreState] = useState<ConnectionState>('a verificar');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Core indisponível');
        setCoreState('ligado');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') setCoreState('indisponível');
      });
    return () => controller.abort();
  }, []);

  const filteredLines = useMemo(() => lines.filter((line) => {
    const text = `${line.number} ${line.name} ${line.stops.join(' ')}`.toLocaleLowerCase('pt-PT');
    return (selectedLine === 'todas' || selectedLine === line.number) &&
      text.includes(query.trim().toLocaleLowerCase('pt-PT'));
  }), [query, selectedLine]);
  const visibleDepartures = departures.filter((item) => selectedLine === 'todas' || item.line === selectedLine);
  const today = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  function toggle(value: string, items: string[], update: (next: string[]) => void) {
    update(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  }

  function addTicket(id: string, name: string) {
    setOwnedTickets((current) => [...current, id]);
    setNotice(`${name} adicionado à carteira de demonstração.`);
    window.setTimeout(() => setNotice(''), 4000);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => setView('inicio')} aria-label="Ir para a visão geral">
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        <span><strong>metro<span>bus</span></strong><small>Coimbra em movimento</small></span>
      </button>
      <span className="sidebar-label">EXPLORAR</span>
      <nav className="main-nav" aria-label="Navegação principal">
        {menu.map((item) => <button key={item.id} className={view === item.id ? 'nav-item active' : 'nav-item'} aria-current={view === item.id ? 'page' : undefined} onClick={() => setView(item.id)}>
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.title}
          {item.id === 'alertas' && <span className="nav-count">{disruptions.length}</span>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-promo"><span className="promo-icon">✦</span><strong>Viaja com informação.</strong><p>Consulta linhas, acompanha alterações e prepara a próxima viagem.</p><button onClick={() => setView('linhas')}>Explorar rede ↗</button></div>
        <div className="connection"><i className={`connection-dot ${coreState.replace(' ', '-')}`} />Core API: {coreState}</div>
      </div>
    </aside>

    <div className="main-column">
      <header className="topbar"><span className="mobile-brand">metro<span>bus</span></span><span className="location">⌖ &nbsp;Coimbra, Portugal</span><div className="topbar-right"><span className="demo-tag">AMBIENTE DE DEMONSTRAÇÃO</span><span className="avatar" aria-label="Perfil de exemplo">M</span></div></header>
      <main className="content">
        <div className="page-heading"><div><p className="date-label">{today}</p><h1>{view === 'inicio' ? 'Bom dia, Mariana.' : menu.find((item) => item.id === view)?.title}</h1><p>{view === 'inicio' ? 'Tudo o que precisas para te mover pela cidade.' : 'Explora os dados e interações de demonstração.'}</p></div><span className="live-pill"><i /> Dados de exemplo</span></div>

        {view === 'inicio' && <>
          <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><span>A TUA CIDADE, À TUA MANEIRA</span><h2 id="hero-title">A próxima viagem<br />começa aqui<b>.</b></h2><p>Encontra a tua linha, consulta as próximas partidas e segue viagem com tranquilidade.</p><button onClick={() => setView('linhas')}>Ver linhas e horários ↗</button></div><div className="hero-art" aria-hidden="true"><div className="orbit one" /><div className="orbit two" /><div className="art-route" /><i className="art-stop first" /><i className="art-stop second" /><i className="art-stop third" /><span className="art-bus">M</span><span className="art-label">EM MOVIMENTO</span></div></section>
          <div className="stats-grid"><div className="stat-card"><span className="stat-icon peach">≋</span><div><strong>{lines.length}</strong><span>Linhas na rede</span></div></div><div className="stat-card"><span className="stat-icon lavender">◷</span><div><strong>{departures.length}</strong><span>Partidas de exemplo</span></div></div><div className="stat-card"><span className="stat-icon mint">◉</span><div><strong>{disruptions.length}</strong><span>Alterações de exemplo</span></div></div></div>
        </>}

        {(view === 'inicio' || view === 'linhas') && <>
          <section className="section-block" aria-labelledby="lines-title">
            <div className="section-header"><div><span className="eyebrow">A REDE</span><h2 id="lines-title">{view === 'inicio' ? 'Linhas em destaque' : 'Linhas e paragens'}</h2><p>Pesquisa uma linha ou paragem e consulta o percurso ordenado.</p></div>{view === 'inicio' && <button className="text-link" onClick={() => setView('linhas')}>Ver todas ↗</button>}</div>
            <div className="filter-row"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Pesquisar linha ou paragem</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar linha ou paragem..." /></label><div className="filter-chips" aria-label="Filtrar linhas"><button className={selectedLine === 'todas' ? 'chip selected' : 'chip'} onClick={() => setSelectedLine('todas')}>Todas</button>{lines.map((line) => <button key={line.number} className={selectedLine === line.number ? 'chip selected' : 'chip'} onClick={() => setSelectedLine(line.number)}>{line.number}</button>)}</div></div>
            <div className="line-grid">{filteredLines.slice(0, view === 'inicio' ? 3 : undefined).map((line) => <article className="line-card" key={line.number}><div className="line-card-top"><LineBadge line={line} /><button className={favorites.includes(line.number) ? 'favorite on' : 'favorite'} aria-label={`${favorites.includes(line.number) ? 'Remover' : 'Adicionar'} linha ${line.number} ${favorites.includes(line.number) ? 'dos' : 'aos'} favoritos`} aria-pressed={favorites.includes(line.number)} onClick={() => toggle(line.number, favorites, setFavorites)}>☆</button></div><h3>{line.name}</h3><div className="route"><span>{line.stops[0]}</span><i /><span>{line.stops.at(-1)}</span></div><p className="line-meta">{line.stops.length} paragens <span>·</span> {line.frequency}</p>{view === 'linhas' && <div className="stop-list"><small>PARAGENS</small>{line.stops.map((stop, index) => <div key={stop}><i />{stop}<small>{index === 0 ? 'Início' : index === line.stops.length - 1 ? 'Fim' : ''}</small></div>)}</div>}</article>)}{filteredLines.length === 0 && <p className="empty-state">Não há linhas de exemplo que correspondam à pesquisa.</p>}</div>
          </section>
          <div className="lower-grid"><section className="panel" aria-labelledby="departures-title"><div className="panel-header"><div><span className="eyebrow">PLANEIA A VIAGEM</span><h2 id="departures-title">Próximas partidas</h2></div><small>Horários ilustrativos</small></div><div className="departure-list">{visibleDepartures.map((item) => <div className="departure" key={item.id}><div className="departure-time"><strong>{item.time}</strong><span>{item.delay ? `+${item.delay} min` : 'Pontual'}</span></div><LineBadge line={lines.find((line) => line.number === item.line)!} small /><div className="departure-route"><strong>{item.destination}</strong><span>Via {item.via}</span></div><Occupancy level={item.occupancy} /></div>)}{visibleDepartures.length === 0 && <p className="empty-state">Sem partidas de exemplo para esta linha.</p>}</div></section><section className="panel alert-panel" aria-labelledby="operations-title"><div className="panel-header"><div><span className="eyebrow">ESTADO DA REDE</span><h2 id="operations-title">Avisos de serviço</h2></div><button className="text-link" onClick={() => setView('alertas')}>Ver todos ↗</button></div>{disruptions.map((item) => <article className="mini-alert" key={item.id}><span className={`alert-icon ${item.severity}`}>!</span><div><small>{item.type} · Linha {item.line}</small><h3>{item.title}</h3><p>{item.summary}</p></div></article>)}</section></div>
        </>}

        {view === 'bilhetes' && <section className="section-block"><div className="section-header"><div><span className="eyebrow">BILHÉTICA</span><h2>Os teus bilhetes</h2><p>Compara modalidades e experimenta adicionar um bilhete à carteira.</p></div></div><div className="ticket-wallet"><div className="wallet-visual"><div className="wallet-top"><span>METROBUS <small>COIMBRA</small></span><span>M</span></div><div><small>CARTEIRA DE DEMONSTRAÇÃO</small><strong>{ownedTickets.length} {ownedTickets.length === 1 ? 'bilhete' : 'bilhetes'}</strong><p>Mariana Ferreira</p></div></div><div className="wallet-copy"><span>▤</span><h3>A mobilidade no teu bolso</h3><p>Esta carteira mostra apenas dados locais de exemplo. A compra e a validação reais ainda não estão disponíveis.</p></div></div><div className="section-header ticket-heading"><div><span className="eyebrow">ESCOLHE O TEU</span><h2>Modalidades disponíveis</h2></div></div><div className="ticket-grid">{ticketOptions.map((ticket) => <article className="ticket-card" key={ticket.id}><span>{ticket.label}</span><h3>{ticket.name}</h3><p>{ticket.description}</p><div className="ticket-footer"><div><strong>{ticket.price}</strong><small>{ticket.validity}</small></div><button onClick={() => addTicket(ticket.id, ticket.name)}>Adicionar ↗</button></div></article>)}</div></section>}

        {view === 'alertas' && <section className="section-block"><div className="section-header"><div><span className="eyebrow">MANTÉM-TE INFORMADA</span><h2>Alertas e subscrições</h2><p>Acompanha alterações e escolhe as linhas que queres seguir.</p></div></div><div className="alerts-layout"><div className="panel"><div className="panel-header"><div><span className="eyebrow">OPERAÇÃO</span><h2>Alterações de serviço</h2></div></div>{disruptions.map((item) => <article className="detail-alert" key={item.id}><div className="detail-alert-head"><span className={`alert-icon ${item.severity}`}>!</span><div><small>{item.type} · Linha {item.line}</small><h3>{item.title}</h3></div></div><p>{item.detail}</p><span>{item.period}</span></article>)}</div><div className="panel subscriptions"><div className="panel-header"><div><span className="eyebrow">PREFERÊNCIAS</span><h2>As tuas linhas</h2></div></div><p>Ativa os avisos para as linhas que te interessam. Esta escolha fica apenas nesta sessão.</p>{lines.map((line) => <div className="subscription-row" key={line.number}><LineBadge line={line} small /><div><strong>Linha {line.number}</strong><span>{line.name}</span></div><button className={subscriptions.includes(line.number) ? 'toggle on' : 'toggle'} role="switch" aria-checked={subscriptions.includes(line.number)} aria-label={`Avisos da linha ${line.number}`} onClick={() => toggle(line.number, subscriptions, setSubscriptions)}><i /></button></div>)}</div></div></section>}

        <footer className="page-footer"><span>MetroIsJustABus · Protótipo de demonstração</span><span>Dados fictícios, sem compras ou notificações reais.</span></footer>
      </main>
    </div>
    {notice && <div className="toast" role="status">✓ {notice}</div>}
  </div>;
}
