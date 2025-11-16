const assert = require('node:assert');
const test =require('node:test');
const US100 = require('../us100');

test('that 1 is equal 1', () => {
  assert.strictEqual(1, 1);
});

// test('that throws as 1 is not equal 2', () => {
//   // throws an exception because 1 != 2
//   assert.strictEqual(1, 2);
// });
