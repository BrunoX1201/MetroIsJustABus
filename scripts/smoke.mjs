const frontendBindAddress = process.env.FRONTEND_BIND_ADDRESS;
const frontendHost = frontendBindAddress && frontendBindAddress !== '0.0.0.0'
  ? frontendBindAddress
  : '127.0.0.1';
const frontendBaseUrl = `http://${frontendHost}:8080`;

const endpoints = [
  ['http://127.0.0.1:3001/health', 'core-api'],
  ['http://127.0.0.1:3002/health', 'validation-service'],
  ['http://127.0.0.1:3003/health', 'notification-service'],
  [`${frontendBaseUrl}/health`, 'frontend'],
  [`${frontendBaseUrl}/api/health`, 'core-api'],
];

for (const [url, service] of endpoints) {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);

  const body = await response.json();
  if (body.status !== 'ok' || body.service !== service) {
    throw new Error(`${url} returned an unexpected response: ${JSON.stringify(body)}`);
  }

  console.log(`${service}: ${url} OK`);
}

const frontend = await fetch(`${frontendBaseUrl}/`, {
  signal: AbortSignal.timeout(5000),
});
if (!frontend.ok || !(await frontend.text()).includes('MetroIsJustABus')) {
  throw new Error('The frontend page is unavailable');
}
console.log('frontend page OK');
