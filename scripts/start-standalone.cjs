const { spawn } = require('node:child_process');
const path = require('node:path');

const standaloneDir = path.join(__dirname, '..', '.next/standalone');
const serverPath = path.join(standaloneDir, 'server.js');

const child = spawn(process.execPath, [serverPath], {
  cwd: standaloneDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
    PORT: process.env.PORT || '3003',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
