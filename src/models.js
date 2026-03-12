/**
 * Odoo JSON-RPC Toolkit - Model helpers.
 *
 * Pre-built helpers for common Odoo models with
 * convenient methods and field definitions.
 */

class ModelHelper {
  constructor(client, modelName) {
    this.client = client;
    this.model = modelName;
  }

  async search(domain = [], options = {}) {
    return this.client.search(this.model, { domain, ...options });
  }

  async read(ids, fields = []) {
    return this.client.read(this.model, ids, fields);
  }

  async searchRead(domain = [], options = {}) {
    return this.client.searchRead(this.model, { domain, ...options });
  }

  async count(domain = []) {
    return this.client.searchCount(this.model, domain);
  }

  async create(values) {
    return this.client.create(this.model, values);
  }

  async update(ids, values) {
    return this.client.write(this.model, ids, values);
  }

  async remove(ids) {
    return this.client.unlink(this.model, ids);
  }

  async fields(attributes) {
    return this.client.fieldsGet(this.model, attributes);
  }
}


class Partners extends ModelHelper {
  constructor(client) {
    super(client, 'res.partner');
  }

  async companies(options = {}) {
    return this.searchRead([['is_company', '=', true]], options);
  }

  async contacts(options = {}) {
    return this.searchRead([['is_company', '=', false]], options);
  }

  async findByEmail(email) {
    const results = await this.searchRead([['email', '=', email]], { limit: 1 });
    return results[0] || null;
  }

  async findByName(name) {
    return this.searchRead([['name', 'ilike', name]]);
  }
}


class Products extends ModelHelper {
  constructor(client) {
    super(client, 'product.product');
  }

  async available(options = {}) {
    return this.searchRead([['active', '=', true]], options);
  }

  async findBySku(sku) {
    const results = await this.searchRead([['default_code', '=', sku]], { limit: 1 });
    return results[0] || null;
  }

  async inCategory(categoryId, options = {}) {
    return this.searchRead([['categ_id', '=', categoryId]], options);
  }
}


class SaleOrders extends ModelHelper {
  constructor(client) {
    super(client, 'sale.order');
  }

  async draft(options = {}) {
    return this.searchRead([['state', '=', 'draft']], options);
  }

  async confirmed(options = {}) {
    return this.searchRead([['state', '=', 'sale']], options);
  }

  async byPartner(partnerId, options = {}) {
    return this.searchRead([['partner_id', '=', partnerId]], options);
  }

  async confirm(orderId) {
    return this.client.execute(this.model, 'action_confirm', [[orderId]]);
  }
}


class Invoices extends ModelHelper {
  constructor(client) {
    super(client, 'account.move');
  }

  async unpaid(options = {}) {
    return this.searchRead([
      ['move_type', '=', 'out_invoice'],
      ['payment_state', '!=', 'paid'],
    ], options);
  }

  async paid(options = {}) {
    return this.searchRead([
      ['move_type', '=', 'out_invoice'],
      ['payment_state', '=', 'paid'],
    ], options);
  }

  async byPartner(partnerId, options = {}) {
    return this.searchRead([
      ['move_type', '=', 'out_invoice'],
      ['partner_id', '=', partnerId],
    ], options);
  }
}


/**
 * Create model helpers for an OdooClient instance.
 */
function createModels(client) {
  return {
    partners: new Partners(client),
    products: new Products(client),
    saleOrders: new SaleOrders(client),
    invoices: new Invoices(client),
    model: (name) => new ModelHelper(client, name),
  };
}


module.exports = { ModelHelper, Partners, Products, SaleOrders, Invoices, createModels };
