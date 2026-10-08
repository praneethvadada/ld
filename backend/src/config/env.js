import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Always read backend/.env, whichever directory the server is started from.
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
dotenv.config({ path: envPath, quiet: true });

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// Express accepts a hop count (1 behind Nginx) or a named range such as "loopback".
function trustProxy(value) {
  if (!value || value === 'false' || value === '0') return false;
  if (value === 'true') return true;
  const hops = Number(value);
  return Number.isInteger(hops) ? hops : value;
}

function list(value, fallback) {
  const items = String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: positiveInt(process.env.PORT, 5050),
  corsOrigins: list(process.env.CORS_ORIGIN, ['http://localhost:5173']),
  rateLimit: {
    windowMs: positiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    max: positiveInt(process.env.RATE_LIMIT_MAX, 30),
  },
  trustProxy: trustProxy(process.env.TRUST_PROXY),
  participantsRaw: process.env.PARTICIPANTS || '',
};

// The list is held in memory from here on; keep it out of the process environment
// so it cannot leak through child processes or environment dumps.
delete process.env.PARTICIPANTS;
