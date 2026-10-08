import { createApp } from './app.js';
import { config } from './config/env.js';
import { loadParticipants } from './models/participants.js';

const { count, problems } = loadParticipants(config.participantsRaw);

for (const problem of problems) {
  console.warn(`[participants] skipped ${problem}`);
}

if (count === 0) {
  console.error(
    '[participants] No participants loaded. Set PARTICIPANTS in backend/.env, or run "npm run seed -- <file.csv>".'
  );
  process.exit(1);
}

const app = createApp(config);

const server = app.listen(config.port, (error) => {
  if (error) {
    console.error(`[server] Could not start on port ${config.port}: ${error.message}`);
    process.exit(1);
  }
  console.log(`[server] Lucky draw API listening on port ${config.port} (${config.env}), ${count} participants loaded`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
