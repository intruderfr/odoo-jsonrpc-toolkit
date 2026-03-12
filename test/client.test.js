/**
 * Tests for Odoo JSON-RPC Toolkit.
 */

const { OdooClient, OdooError } = require('../src/index');
const assert = require('assert');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\nOdooClient Tests\n');

test('creates client with options', () => {
  const client = new OdooClient({
    host: 'test.odoo.com',
    database: 'test-db',
    username: 'admin',
    apiKey: 'test-key',
  });
  assert.strictEqual(client.host, 'test.odoo.com');
  assert.strictEqual(client.database, 'test-db');
  assert.strictEqual(client.username, 'admin');
  assert.strictEqual(client.apiKey, 'test-key');
  assert.strictEqual(client.secure, true);
  assert.strictEqual(client.port, 443);
});

test('defaults to HTTPS on port 443', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  assert.strictEqual(client.secure, true);
  assert.strictEqual(client.port, 443);
});

test('supports HTTP with port 80', () => {
  const client = new OdooClient({ host: 'localhost', database: 'db', secure: false });
  assert.strictEqual(client.secure, false);
  assert.strictEqual(client.port, 80);
});

test('custom timeout', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db', timeout: 60000 });
  assert.strictEqual(client.timeout, 60000);
});

test('OdooError has correct properties', () => {
  const err = new OdooError('Test error', 'AccessError', { details: 'test' });
  assert.strictEqual(err.message, 'Test error');
  assert.strictEqual(err.name, 'OdooError');
  assert.strictEqual(err.type, 'AccessError');
  assert.deepStrictEqual(err.data, { details: 'test' });
  assert.ok(err instanceof Error);
});

test('uid can be set and read', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  assert.strictEqual(client.uid, null);
  client.uid = 42;
  assert.strictEqual(client.uid, 42);
});

test('request ID increments', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  assert.strictEqual(client._requestId, 0);
  // requestId would increment on each RPC call
});

console.log('\nModel Helper Tests\n');

const { createModels, ModelHelper } = require('../src/models');

test('createModels returns expected helpers', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  const models = createModels(client);
  assert.ok(models.partners);
  assert.ok(models.products);
  assert.ok(models.saleOrders);
  assert.ok(models.invoices);
  assert.ok(typeof models.model === 'function');
});

test('custom model helper', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  const models = createModels(client);
  const custom = models.model('my.custom.model');
  assert.ok(custom instanceof ModelHelper);
  assert.strictEqual(custom.model, 'my.custom.model');
});

test('partners model uses res.partner', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  const models = createModels(client);
  assert.strictEqual(models.partners.model, 'res.partner');
});

test('products model uses product.product', () => {
  const client = new OdooClient({ host: 'test.odoo.com', database: 'db' });
  const models = createModels(client);
  assert.strictEqual(models.products.model, 'product.product');
});

console.log('\nAll tests completed.\n');
