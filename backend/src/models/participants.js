import { normalizePhone } from '../utils/phone.js';

const TRUE_VALUES = new Set(['true', 't', 'yes', 'y', '1', 'w', 'win', 'won', 'winner']);
const FALSE_VALUES = new Set(['false', 'f', 'no', 'n', '0', '', 'l', 'lost', 'not winner', 'non winner', 'non-winner']);

/** Reads a winner flag as written in a spreadsheet. Returns null when it is not recognisable. */
export function parseWinnerFlag(value) {
  const flag = String(value ?? '').trim().toLowerCase();
  if (TRUE_VALUES.has(flag)) return true;
  if (FALSE_VALUES.has(flag)) return false;
  return null;
}

/**
 * Parses the PARTICIPANTS value from .env.
 *
 * One record per line (or separated by ";"), each written as
 *   name,phone_number,is_winner
 * Fields are read from the right, so a name may itself contain commas.
 *
 * The phone number is the unique key: a repeated number keeps its first record.
 */
export function parseParticipants(raw) {
  const participants = new Map();
  const problems = [];

  const records = String(raw ?? '')
    .split(/[\n;]/)
    .map((record) => record.trim())
    .filter(Boolean);

  records.forEach((record, index) => {
    const position = index + 1;
    const fields = record.split(',');
    if (fields.length < 3) {
      problems.push(`record ${position}: expected "name,phone_number,is_winner"`);
      return;
    }

    const winner = parseWinnerFlag(fields.pop());
    const phone = normalizePhone(fields.pop());
    const name = fields.join(',').trim();

    if (!phone) {
      problems.push(`record ${position}: invalid phone number`);
      return;
    }
    if (winner === null) {
      problems.push(`record ${position}: is_winner must be true or false`);
      return;
    }
    if (!name) {
      problems.push(`record ${position}: name is missing`);
      return;
    }
    if (participants.has(phone)) {
      problems.push(`record ${position}: duplicate phone number, first record kept`);
      return;
    }

    participants.set(phone, { name, isWinner: winner });
  });

  return { participants, problems };
}

let store = new Map();

export function loadParticipants(raw) {
  const { participants, problems } = parseParticipants(raw);
  store = participants;
  return { count: participants.size, problems };
}

export function findParticipantByPhone(phone) {
  return store.get(phone) ?? null;
}

export function participantCount() {
  return store.size;
}
