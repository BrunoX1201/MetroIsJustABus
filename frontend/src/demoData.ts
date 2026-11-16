export type Line = { number: string; name: string; color: string; frequency: string; stops: string[] };
export type Departure = { id: string; line: string; time: string; destination: string; via: string; delay: number; occupancy: 'low' | 'medium' | 'high' };

// Dados fictícios para demonstrar a interface; não representam a operação real.
export const lines: Line[] = [
  { number: '7', name: 'Solum ↔ Portagem', color: '#ed7358', frequency: 'A cada 15 min', stops: ['Solum', 'Praça da República', 'Universidade', 'Portagem'] },
  { number: '12', name: 'Universidade ↔ Estação', color: '#8875d4', frequency: 'A cada 20 min', stops: ['Universidade', 'Praça da República', 'Baixa', 'Estação Nova'] },
  { number: '23', name: 'Vale das Flores ↔ Hospital', color: '#3ea69a', frequency: 'A cada 25 min', stops: ['Vale das Flores', 'Solum', 'Celas', 'Hospital'] },
  { number: '31', name: 'Santa Clara ↔ República', color: '#d9a748', frequency: 'A cada 30 min', stops: ['Santa Clara', 'Portagem', 'Baixa', 'Praça da República'] },
];

export const departures: Departure[] = [
  { id: 'd1', line: '7', time: '08:12', destination: 'Portagem', via: 'Universidade', delay: 0, occupancy: 'low' },
  { id: 'd2', line: '12', time: '08:18', destination: 'Estação Nova', via: 'Baixa', delay: 4, occupancy: 'medium' },
  { id: 'd3', line: '23', time: '08:24', destination: 'Hospital', via: 'Celas', delay: 0, occupancy: 'high' },
  { id: 'd4', line: '31', time: '08:35', destination: 'Praça da República', via: 'Portagem', delay: 0, occupancy: 'low' },
];

export const disruptions = [
  { id: 'a1', line: '12', type: 'Atraso', title: 'Atrasos na zona da Baixa', summary: 'Circulação condicionada. Conta com cerca de 4 minutos adicionais.', detail: 'O trânsito na zona da Baixa está a causar atrasos ilustrativos na linha 12. As partidas mantêm-se, com uma estimativa de 4 minutos adicionais.', period: 'Exemplo · período da manhã', severity: 'orange' },
  { id: 'a2', line: '31', type: 'Desvio', title: 'Percurso alternativo em Santa Clara', summary: 'Paragem temporariamente substituída.', detail: 'A paragem inicial de Santa Clara foi substituída por uma paragem provisória para demonstrar como um desvio aparece aos passageiros.', period: 'Exemplo · durante o dia', severity: 'purple' },
] as const;

export const ticketOptions = [
  { id: 'single', label: 'OCASIONAL', name: 'Viagem simples', description: 'Uma viagem na rede, ideal para deslocações pontuais.', price: '2,00 €', validity: '1 viagem' },
  { id: 'day', label: 'FLEXÍVEL', name: 'Passe diário', description: 'Viaja as vezes que precisares durante um dia.', price: '5,50 €', validity: '24 horas' },
  { id: 'monthly', label: 'FREQUENTE', name: 'Passe mensal', description: 'Para quem faz da cidade o seu percurso habitual.', price: '30,00 €', validity: '30 dias' },
] as const;
