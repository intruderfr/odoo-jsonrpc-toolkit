/**
 * Odoo JSON-RPC Toolkit - Basic Usage Example
 *
 * This example demonstrates common operations with the Odoo client.
 * Replace the connection details with your own Odoo instance.
 */

const { OdooClient } = require('../src/index');
const { createModels } = require('../src/models');

async function main() {
  // Initialize client
  const odoo = new OdooClient({
    host: 'mycompany.odoo.com',
    database: 'mycompany-production',
    username: 'admin@mycompany.com',
    apiKey: 'your-api-key-here',
  });

  // Create model helpers
  const models = createModels(odoo);

  // --- Partners ---
  console.log('=== Partners ===');

  // List companies
  const companies = await models.partners.companies({
    fields: ['name', 'email', 'phone'],
    limit: 5,
  });
  console.log('Companies:', companies.map(c => c.name));

  // Find by email
  const partner = await models.partners.findByEmail('contact@example.com');
  if (partner) {
    console.log('Found partner:', partner.name);
  }

  // --- Products ---
  console.log('\n=== Products ===');

  const products = await models.products.available({
    fields: ['name', 'list_price', 'default_code'],
    limit: 5,
  });
  console.log('Products:', products.map(p => `${p.name} ($${p.list_price})`));

  // --- Sale Orders ---
  console.log('\n=== Sale Orders ===');

  const drafts = await models.saleOrders.draft({
    fields: ['name', 'partner_id', 'amount_total'],
    limit: 5,
  });
  console.log('Draft orders:', drafts.length);

  // --- Raw execute for custom models ---
  console.log('\n=== Custom Query ===');

  const custom = models.model('hr.employee');
  const employees = await custom.searchRead(
    [['department_id.name', 'ilike', 'IT']],
    { fields: ['name', 'job_title'], limit: 10 }
  );
  console.log('IT Department:', employees.map(e => e.name));

  // --- Count records ---
  const totalPartners = await models.partners.count();
  console.log(`\nTotal partners: ${totalPartners}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
