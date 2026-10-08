import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizePhone } from '../src/utils/phone.js';

test('accepts the common ways of writing an Indian mobile number', () => {
  const variants = [
    '9876543210',
    '+919876543210',
    '+91 9876543210',
    '+91 98765 43210',
    '+91-98765-43210',
    '919876543210',
    '09876543210',
    '00919876543210',
    '  98765 43210  ',
    '(98765) 43210',
    9876543210,
  ];

  for (const variant of variants) {
    assert.equal(normalizePhone(variant), '9876543210', `failed for ${JSON.stringify(variant)}`);
  }
});

test('rejects input that is not a valid Indian mobile number', () => {
  const invalid = [
    '',
    '   ',
    '12345',
    '987654321',
    '98765432101',
    '1234567890',
    '5876543210',
    '98765abcde',
    '9876543210; DROP TABLE participants',
    '+1 9876543210',
    '+91+9876543210',
    '9'.repeat(30),
    null,
    undefined,
    {},
    ['9876543210'],
    true,
  ];

  for (const value of invalid) {
    assert.equal(normalizePhone(value), null, `should reject ${JSON.stringify(value)}`);
  }
});
