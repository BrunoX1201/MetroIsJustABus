import { app } from './app.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}

const server = app.listen(port, host, () => {
  console.log(`core-api listening on http://${host}:${port}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());

