const endpoints = [
  ['http://127.0.0.1:3001/health', 'core-api'],
  ['http://127.0.0.1:3002/health', 'validation-service'],
  ['http://127.0.0.1:3003/health', 'notification-service'],
  ['http://127.0.0.1:8080/health', 'frontend'],
  ['http://127.0.0.1:8080/api/health', 'core-api'],
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

const frontend = await fetch('http://127.0.0.1:8080/', {
  signal: AbortSignal.timeout(5000),
});
if (!frontend.ok || !(await frontend.text()).includes('MetroIsJustABus')) {
  throw new Error('The frontend page is unavailable');
}
console.log('frontend page OK');
