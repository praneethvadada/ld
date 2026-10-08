import { parseWinnerFlag } from '../src/models/participants.js';
import { normalizePhone } from '../src/utils/phone.js';

const HEADER_ALIASES = {
  name: ['name', 'participant_name', 'participant', 'full_name'],
  phone: ['phone_number', 'phone', 'phone_no', 'mobile', 'mobile_number', 'mobile_no', 'contact', 'contact_number'],
  winner: ['is_winner', 'winner', 'winner_status', 'status', 'result', 'won'],
};

/** Minimal RFC 4180 reader: quoted fields, doubled quotes, and line breaks inside quotes. */
export function parseCsv(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char !== '"') field += char;
      else if (text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') field += char;
  }

  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// Excel exports with ";" or tabs in some regional settings.
function detectDelimiter(headerLine) {
  const candidates = [',', ';', '\t'];
  return candidates.reduce((best, candidate) =>
    headerLine.split(candidate).length > headerLine.split(best).length ? candidate : best
  );
}

function headerKey(cell) {
  return cell
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Names are written into a quoted .env value, one record per line, so drop the
// characters that would end the value or the record early.
function cleanName(value) {
  return String(value ?? '')
    .replace(/["`\\;\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPhone(value) {
  return String(value ?? '')
    .trim()
    .replace(/^'+/, '')
    .replace(/\.0+$/, '');
}

/**
 * Reads a participant sheet (CSV text) into validated records.
 * Row numbers in the messages match the row numbers shown in Excel.
 */
export function readParticipantSheet(text) {
  const errors = [];
  const warnings = [];
  const participants = [];

  const content = text.replace(/^﻿/, '');
  const firstLine = content.split(/\r?\n/, 1)[0] ?? '';
  const rows = parseCsv(content, detectDelimiter(firstLine));

  if (rows.length === 0) {
    return { participants, warnings, errors: ['The file is empty.'] };
  }

  const headers = rows[0].map(headerKey);
  const column = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    column[field] = headers.findIndex((header) => aliases.includes(header));
  }

  const missing = Object.keys(column).filter((field) => column[field] === -1);
  if (missing.length) {
    return {
      participants,
      warnings,
      errors: [
        `Header row must contain name, phone_number and is_winner columns. ` +
          `Could not find: ${missing.join(', ')}. Found: ${rows[0].join(', ')}`,
      ],
    };
  }

  const seen = new Map();

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    if (cells.every((cell) => cell.trim() === '')) return;

    const name = cleanName(cells[column.name]);
    const rawPhone = cleanPhone(cells[column.phone]);
    const phone = normalizePhone(rawPhone);
    const isWinner = parseWinnerFlag(cells[column.winner]);

    if (!name) {
      errors.push(`Row ${rowNumber}: name is empty.`);
      return;
    }
    if (!phone) {
      const hint = /e\+?\d+$/i.test(rawPhone)
        ? ' Excel stored it in scientific notation: format the column as a number with no decimals, then export again.'
        : '';
      errors.push(`Row ${rowNumber}: "${rawPhone}" is not a valid 10-digit mobile number.${hint}`);
      return;
    }
    if (isWinner === null) {
      errors.push(`Row ${rowNumber}: winner status "${cells[column.winner]}" must be true or false.`);
      return;
    }

    const earlier = seen.get(phone);
    if (earlier) {
      if (earlier.isWinner === isWinner) {
        warnings.push(`Row ${rowNumber}: same phone number as row ${earlier.rowNumber}, kept the first.`);
      } else {
        errors.push(
          `Row ${rowNumber}: same phone number as row ${earlier.rowNumber} but a different winner status.`
        );
      }
      return;
    }

    seen.set(phone, { rowNumber, isWinner });
    participants.push({ name, phone, isWinner });
  });

  return { participants, warnings, errors };
}
