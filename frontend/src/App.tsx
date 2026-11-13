import { useEffect, useState } from 'react';

type ConnectionState = 'a verificar' | 'ligado' | 'indisponível';

export default function App() {
  const [coreState, setCoreState] = useState<ConnectionState>('a verificar');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Core indisponível');
        setCoreState('ligado');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setCoreState('indisponível');
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="shell">
      <p className="eyebrow">MetroIsJustABus</p>
      <h1>A próxima paragem começa aqui</h1>
      <p>
        O frontend React está configurado. As funcionalidades de consulta,
        bilhética, validação e notificações serão implementadas nas próximas etapas.
      </p>
      <div className="status" role="status">
        <span>Ligação ao Core</span>
        <strong>{coreState}</strong>
      </div>
    </main>
  );
}

