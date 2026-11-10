import { spawn } from 'node:child_process';

const workspaces = [
  'frontend',
  'backend/core-api',
  'backend/validation-service',
  'backend/notification-service',
];

const children = new Map();
let composeProcess;
let composeTask;
let composeStarted = false;
let shutdownTask;

function runCompose(args) {
  const child = spawn('docker', ['compose', ...args], { stdio: 'inherit' });
  composeProcess = child;

  const task = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code) => resolve(code ?? 1));
  });

  composeTask = task;
  task.finally(() => {
    if (composeProcess === child) composeProcess = undefined;
  }).catch(() => {});
  return task;
}

function signalTree(child, signal) {
  if (!child.pid) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') console.error(error);
  }
}

function waitForExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    child.once('close', resolve);
    setTimeout(resolve, 4000);
  });
}

function stop(exitCode = 0) {
  if (shutdownTask) return shutdownTask;
  process.exitCode = exitCode;

  shutdownTask = (async () => {
    console.log('\nA parar os serviços...');

    if (composeProcess) composeProcess.kill('SIGTERM');
    for (const child of children.values()) signalTree(child, 'SIGTERM');

    const forceTimer = setTimeout(() => {
      for (const child of children.values()) {
        if (child.exitCode === null && child.signalCode === null) {
          signalTree(child, 'SIGKILL');
        }
      }
    }, 3000);

    await Promise.all([...children.values()].map(waitForExit));
    clearTimeout(forceTimer);

    if (composeStarted) {
      try {
        await composeTask?.catch(() => {});
        const code = await runCompose(['down']);
        if (code !== 0 && process.exitCode === 0) process.exitCode = 1;
      } catch (error) {
        console.error('Não foi possível parar o Compose:', error);
        process.exitCode = 1;
      }
    }
  })();

  return shutdownTask;
}

process.on('SIGINT', () => void stop(130));
process.on('SIGTERM', () => void stop(143));

try {
  composeStarted = true;
  const code = await runCompose(['up', '-d', '--wait']);
  if (code !== 0) throw new Error(`Docker Compose terminou com código ${code}`);

  if (!shutdownTask) {
    for (const workspace of workspaces) {
      const child = spawn('npm', ['run', 'dev', '--workspace', workspace], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        detached: process.platform !== 'win32',
      });
      children.set(workspace, child);

      child.on('error', (error) => {
        console.error(`${workspace}:`, error);
        void stop(1);
      });
      child.on('exit', (childCode, signal) => {
        if (!shutdownTask) {
          console.error(`${workspace} terminou (${signal ?? childCode}).`);
          void stop(childCode || 1);
        }
      });
    }
  }
} catch (error) {
  console.error(error);
  await stop(1);
}

