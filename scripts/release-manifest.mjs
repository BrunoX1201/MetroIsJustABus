import { mkdir, writeFile } from 'node:fs/promises';

const { IMAGE_PREFIX, IMAGE_TAG, GITHUB_SHA } = process.env;
if (!IMAGE_PREFIX || !IMAGE_TAG || !GITHUB_SHA) {
  throw new Error('IMAGE_PREFIX, IMAGE_TAG and GITHUB_SHA are required');
}

const services = ['frontend', 'core-api', 'validation-service', 'notification-service'];
const images = Object.fromEntries(
  services.map((service) => [service, `${IMAGE_PREFIX}/${service}:${IMAGE_TAG}`]),
);

await mkdir('release', { recursive: true });
await writeFile(
  'release/manifest.json',
  `${JSON.stringify({ commit: GITHUB_SHA, images }, null, 2)}\n`,
);
