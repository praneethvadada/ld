// Imports a participant sheet (exported as CSV) into the PARTICIPANTS entry of backend/.env.
//
//   npm run seed -- path/to/participants.csv
//   npm run seed -- path/to/participants.csv --dry-run        check the sheet, write nothing
//   npm run seed -- path/to/participants.csv --skip-invalid   import the valid rows, leave out the rest
//
// Each run replaces the whole list. Restart the backend afterwards so it loads the new list.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readParticipantSheet } from './sheet.js';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const csvPath = args.find((arg) => !arg.startsWith('--'));

if (!csvPath) {
  console.error('Usage: npm run seed -- <path/to/participants.csv> [--dry-run] [--skip-invalid]');
  process.exit(1);
}

let text;
try {
  text = fs.readFileSync(path.resolve(process.cwd(), csvPath), 'utf8');
} catch {
  console.error(`Could not read "${csvPath}". Check the path and try again.`);
  process.exit(1);
}

const { participants, warnings, errors } = readParticipantSheet(text);

for (const warning of warnings) console.warn(`  note   ${warning}`);
for (const error of errors) console.error(`  error  ${error}`);

if (errors.length && !flags.has('--skip-invalid')) {
  console.error(
    `\n${errors.length} row(s) need fixing. Nothing was written.\n` +
      'Correct the sheet and run again, or add --skip-invalid to import only the valid rows.'
  );
  process.exit(1);
}

if (participants.length === 0) {
  console.error('\nNo valid participants found. Nothing was written.');
  process.exit(1);
}

const summary =
  `${participants.length} winner(s)` + (errors.length ? `, ${errors.length} invalid row(s) left out` : '');

if (flags.has('--dry-run')) {
  console.log(`\nDry run: ${summary}. Nothing was written.`);
  process.exit(0);
}

const block = `PARTICIPANTS="\n${participants
  .map(({ name, phone }) => `${name},${phone}`)
  .join('\n')}\n"`;

// Start from the existing .env so the other settings are kept; fall back to the template.
const basePath = fs.existsSync(envPath) ? envPath : envExamplePath;
const current = fs.existsSync(basePath) ? fs.readFileSync(basePath, 'utf8') : '';
const existingEntry = /^PARTICIPANTS\s*=\s*(?:"[^"]*"|'[^']*'|.*)$/m;
const next = existingEntry.test(current)
  ? current.replace(existingEntry, () => block)
  : `${current.trimEnd()}\n\n${block}\n`;

// Write to a temporary file first so a failed write never leaves a half-written .env.
const temporaryPath = `${envPath}.tmp`;
fs.writeFileSync(temporaryPath, next, { mode: 0o600 });
fs.renameSync(temporaryPath, envPath);

console.log(`\nImported ${summary} into backend/.env`);
console.log('Restart the backend to load the new list.');
