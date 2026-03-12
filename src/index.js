/**
 * Odoo JSON-RPC Toolkit - Main client module.
 *
 * A lightweight, zero-dependency Node.js client for the Odoo ERP
 * JSON-RPC API with promise-based CRUD operations.
 */

const https = require('https');
const http = require('http');

class OdooClient {
  /**
   * @param {Object} options
   * @param {string} options.host - Odoo server hostname
   * @param {string} options.database - Database name
   * @param {string} [options.username] - Username for authentication
   * @param {string} [options.apiKey] - API key (alternative to password)
   * @param {number} [options.port] - Server port
   * @param {boolean} [options.secure=true] - Use HTTPS
   * @param {number} [options.timeout=30000] - Request timeout in ms
   */
  constructor(options = {}) {
    this.host = options.host;
    this.database = options.database;
    this.username = options.username || '';
    this.apiKey = options.apiKey || '';
    this.port = options.port || (options.secure === false ? 80 : 443);
    this.secure = options.secure !== false;
    this.timeout = options.timeout || 30000;
    this._uid = null;
    this._requestId = 0;
  }

  /**
   * Make a JSON-RPC call to the Odoo server.
   */
  _rpc(path, params) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: ++this._requestId,
        params,
      });

      const transport = this.secure ? https : http;
      const req = transport.request({
        hostname: this.host,
        port: this.port,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: this.timeout,
      }, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              const err = new OdooError(
                json.error.data?.message || json.error.message || 'RPC Error',
                json.error.data?.exception_type,
                json.error
              );
              reject(err);
            } else {
              resolve(json.result);
            }
          } catch (e) {
            reject(new OdooError(`Invalid JSON response: ${e.message}`));
          }
        });
      });

      req.on('error', err => reject(new OdooError(`Network error: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new OdooError('Request timeout'));
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Authenticate with username and password.
   */
  async authenticate(username, password) {
    this.username = username || this.username;
    const uid = await this._rpc('/jsonrpc', {
      service: 'common',
      method: 'authenticate',
      args: [this.database, this.username, password, {}],
    });
    if (!uid) throw new OdooError('Authentication failed');
    this._uid = uid;
    return uid;
  }

  /**
   * Get the current user ID. Uses API key auth if no password login.
   */
  get uid() {
    return this._uid;
  }

  /**
   * Set UID directly (for API key authentication).
   */
  set uid(value) {
    this._uid = value;
  }

  /**
   * Execute a model method via execute_kw.
   */
  async execute(model, method, args = [], kwargs = {}) {
    if (!this._uid && this.apiKey) {
      // Auto-detect UID with API key
      this._uid = await this._rpc('/jsonrpc', {
        service: 'common',
        method: 'authenticate',
        args: [this.database, this.username, this.apiKey, {}],
      });
    }

    const credential = this.apiKey || '';
    return this._rpc('/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [this.database, this._uid, credential, model, method, args, kwargs],
    });
  }

  /**
   * Search for record IDs matching a domain.
   */
  async search(model, options = {}) {
    const { domain = [], limit, offset, order } = options;
    const kwargs = {};
    if (limit !== undefined) kwargs.limit = limit;
    if (offset !== undefined) kwargs.offset = offset;
    if (order) kwargs.order = order;
    return this.execute(model, 'search', [domain], kwargs);
  }

  /**
   * Read specific records by ID.
   */
  async read(model, ids, fields = []) {
    const kwargs = {};
    if (fields.length > 0) kwargs.fields = fields;
    return this.execute(model, 'read', [ids], kwargs);
  }

  /**
   * Search and read records in one call.
   */
  async searchRead(model, options = {}) {
    const { domain = [], fields = [], limit, offset, order } = options;
    const kwargs = {};
    if (fields.length > 0) kwargs.fields = fields;
    if (limit !== undefined) kwargs.limit = limit;
    if (offset !== undefined) kwargs.offset = offset;
    if (order) kwargs.order = order;
    return this.execute(model, 'search_read', [domain], kwargs);
  }

  /**
   * Count records matching a domain.
   */
  async searchCount(model, domain = []) {
    return this.execute(model, 'search_count', [domain]);
  }

  /**
   * Create a new record.
   */
  async create(model, values) {
    return this.execute(model, 'create', [values]);
  }

  /**
   * Update existing records.
   */
  async write(model, ids, values) {
    return this.execute(model, 'write', [ids, values]);
  }

  /**
   * Delete records.
   */
  async unlink(model, ids) {
    return this.execute(model, 'unlink', [ids]);
  }

  /**
   * Get field definitions for a model.
   */
  async fieldsGet(model, attributes = ['string', 'type', 'required']) {
    return this.execute(model, 'fields_get', [], { attributes });
  }
}


class OdooError extends Error {
  constructor(message, type, data) {
    super(message);
    this.name = 'OdooError';
    this.type = type;
    this.data = data;
  }
}


module.exports = { OdooClient, OdooError };
