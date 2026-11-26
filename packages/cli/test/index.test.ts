import assert from 'node:assert/strict';
import { test } from 'node:test';

test('cli package entry point loads', async () => {
  const entry = await import('../src/index.ts');
  assert.deepEqual(Object.keys(entry), []);
});
