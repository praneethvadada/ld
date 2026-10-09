import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseParticipants, parseWinnerFlag } from '../src/models/participants.js';
import { readParticipantSheet } from '../seed/sheet.js';

test('parses one record per line', () => {
  const { participants, problems } = parseParticipants(`
    Praneeth,9876543210,true
    Rahul,9876543211,false
  `);

  assert.deepEqual(problems, []);
  assert.equal(participants.size, 2);
  assert.deepEqual(participants.get('9876543210'), { name: 'Praneeth', isWinner: true });
  assert.deepEqual(participants.get('9876543211'), { name: 'Rahul', isWinner: false });
});

test('treats two-column records as winners', () => {
  const { participants, problems } = parseParticipants('Praneeth,9876543210\nSuresh,9876543212');

  assert.deepEqual(problems, []);
  assert.deepEqual(participants.get('9876543210'), { name: 'Praneeth', isWinner: true });
  assert.deepEqual(participants.get('9876543212'), { name: 'Suresh', isWinner: true });
});

test('also accepts a single line separated by semicolons', () => {
  const { participants } = parseParticipants('Praneeth,9876543210,true;Rahul,+91 98765 43211,no');

  assert.equal(participants.size, 2);
  assert.equal(participants.get('9876543211').isWinner, false);
});

test('keeps commas that are part of a name', () => {
  const { participants } = parseParticipants('Rao, K. Suresh,9876543212,yes');

  assert.deepEqual(participants.get('9876543212'), { name: 'Rao, K. Suresh', isWinner: true });
});

test('stores a phone number once and reports the bad records', () => {
  const { participants, problems } = parseParticipants(`
    Praneeth,9876543210,true
    Impostor,+919876543210,false
    Broken,12345,true
    Unclear,9876543213,maybe
    ,9876543214,true
    incomplete
  `);

  assert.equal(participants.size, 1);
  assert.equal(participants.get('9876543210').name, 'Praneeth');
  assert.equal(problems.length, 5);
});

test('reads winner flags as written in spreadsheets', () => {
  for (const value of ['true', 'TRUE', 'Yes', 'y', '1', 'Winner', ' won ']) {
    assert.equal(parseWinnerFlag(value), true, value);
  }
  for (const value of ['false', 'No', 'n', '0', '', 'Not Winner', undefined]) {
    assert.equal(parseWinnerFlag(value), false, String(value));
  }
  assert.equal(parseWinnerFlag('maybe'), null);
});

test('reads a participant sheet with flexible headers, quotes and a BOM', () => {
  const sheet = [
    '﻿Participant Name,Phone Number,Winner Status',
    'Praneeth,+91 98765 43210,Winner',
    '"Rao, Suresh",9876543212.0,Not Winner',
    ',,',
    'Anil;"Tricky",9876543213,no',
  ].join('\r\n');

  const { participants, errors, warnings } = readParticipantSheet(sheet);

  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.deepEqual(participants, [
    { name: 'Praneeth', phone: '9876543210', isWinner: true },
    { name: 'Rao, Suresh', phone: '9876543212', isWinner: false },
    { name: 'Anil Tricky', phone: '9876543213', isWinner: false },
  ]);
});

test('reports sheet problems with their Excel row numbers', () => {
  const sheet = [
    'name,phone_number,is_winner',
    'Praneeth,9876543210,true',
    'Short,98765,false',
    'Science,9.87654E+09,false',
    'Repeat,9876543210,true',
    'Conflict,9876543210,false',
    'Vague,9876543215,perhaps',
  ].join('\n');

  const { participants, errors, warnings } = readParticipantSheet(sheet);

  assert.equal(participants.length, 1);
  assert.equal(warnings.length, 2);
  assert.match(warnings[0], /^Row 5:/);
  assert.equal(errors.length, 3);
  assert.match(errors[0], /^Row 3:/);
  assert.match(errors[1], /scientific notation/);
  assert.match(errors[2], /^Row 7:/);
});

test('rejects a sheet without the expected columns', () => {
  const { participants, errors } = readParticipantSheet('first,second\nPraneeth,9876543210');

  assert.equal(participants.length, 0);
  assert.match(errors[0], /Could not find: name, phone/);
});
