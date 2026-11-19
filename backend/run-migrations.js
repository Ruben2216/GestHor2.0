import { dbConnection } from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('Migrations to run:', files);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n=== Running ${file} ===`);
    await dbConnection.tx(transaction => transaction.multi(sql));
    console.log(`  ✓ ${file} ejecutada correctamente`);
  }
  
  console.log('\n✅ All migrations completed!');
}

try {
  await runMigrations();
} catch (error) {
  console.error('\n❌ Migration failed. The current migration was rolled back.');
  console.error(`Error ${error.code || ''}: ${error.message}`);
  if (error.where) console.error(error.where);
  process.exitCode = 1;
} finally {
  await dbConnection.$pool.end();
}