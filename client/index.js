import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from './nillionOrgConfig.js';
import schema from './schema.json' with { type: 'json' };

async function createSchema() {
  try {
    const org = new SecretVaultWrapper(orgConfig.nodes, orgConfig.orgCredentials);
    await org.init();

    const collectionName = 'Agent Data';
    const newSchema = await org.createSchema(schema, collectionName);
    console.log('✅ Schema created:', newSchema[0].result.data);
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
  }
}

createSchema();
