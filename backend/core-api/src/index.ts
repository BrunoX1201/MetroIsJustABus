import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.disable('x-powered-by');
app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'core-api' });
});

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`core-api listening on http://127.0.0.1:${port}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());

