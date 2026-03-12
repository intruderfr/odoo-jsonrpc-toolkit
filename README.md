# 🔧 Odoo JSON-RPC Toolkit

[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![npm](https://img.shields.io/badge/npm-v0.1.0-red.svg)]()

A lightweight, zero-dependency Node.js client for the Odoo ERP JSON-RPC API. Provides a clean, promise-based interface for authentication, CRUD operations, and method execution.

## Features

- 🔌 **Zero Dependencies** — Uses only Node.js built-in `https` module
- 🔐 **Simple Authentication** — Login once, automatic session management
- 📦 **Full CRUD** — Search, read, create, update, and delete records
- 🔍 **Domain Builder** — Fluent API for building Odoo domain filters
- 📊 **Batch Operations** — Efficient bulk create/update operations
- 🏗️ **Model Helpers** — Pre-built helpers for common Odoo models

## Installation

```bash
npm install odoo-jsonrpc-toolkit
```

## Quick Start

```javascript
const { OdooClient } = require('odoo-jsonrpc-toolkit');

const odoo = new OdooClient({
  host: 'mycompany.odoo.com',
  database: 'mycompany-main',
  username: 'admin@company.com',
  apiKey: 'your-api-key-here',
});

// Search partners
const partners = await odoo.searchRead('res.partner', {
  domain: [['is_company', '=', true]],
  fields: ['name', 'email', 'phone'],
  limit: 10,
});

console.log(partners);
```

## API Reference

### Authentication

```javascript
// API Key auth (recommended)
const odoo = new OdooClient({
  host: 'mycompany.odoo.com',
  database: 'mydb',
  username: 'user@company.com',
  apiKey: 'api-key',
});

// Password auth
await odoo.authenticate('user@company.com', 'password');
```

### CRUD Operations

```javascript
// Search with domain filters
const ids = await odoo.search('res.partner', {
  domain: [['country_id.code', '=', 'US']],
  limit: 50,
});

// Read specific fields
const records = await odoo.read('res.partner', [1, 2, 3], ['name', 'email']);

// Search + Read combined
const results = await odoo.searchRead('res.partner', {
  domain: [['is_company', '=', true]],
  fields: ['name', 'email'],
  order: 'name asc',
  limit: 20,
  offset: 0,
});

// Count records
const count = await odoo.searchCount('res.partner', [['is_company', '=', true]]);

// Create
const id = await odoo.create('res.partner', { name: 'New Partner', email: 'new@test.com' });

// Update
await odoo.write('res.partner', [id], { phone: '+1234567890' });

// Delete
await odoo.unlink('res.partner', [id]);
```

## License

MIT License — see [LICENSE](LICENSE) for details.
