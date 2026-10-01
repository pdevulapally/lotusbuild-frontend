import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTokenUsage } from '../src/lib/usage.ts';

test('token usage retains separate backend usage and reservations', () => {
  const meter = { meterKey: 'input', unit: 'tokens', label: 'Input tokens', consumed: 12, reserved: 3, includedAllowance: 100 };
  assert.deepEqual(parseTokenUsage({ meters: [meter, { unit: 'seconds' }] }), [{ meterKey: 'input', label: 'Input tokens', consumed: 12, reserved: 3, includedAllowance: 100 }]);
});
test('missing or malformed token usage fails explicitly', () => {
  for (const value of [{}, { meters: [] }, { meters: [{ unit: 'tokens', meterKey: 'input', label: 'Input', consumed: -1, reserved: 0, includedAllowance: 10 }] }]) assert.throws(() => parseTokenUsage(value));
});
