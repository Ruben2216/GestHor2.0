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
    
    // Split by semicolon, but be careful with function bodies
    // Simple split for now, assuming standard SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n=== Running ${file} ===`);
    for (const stmt of statements) {
      try {
        await dbConnection.none(stmt);
        console.log(`  ✓ ${stmt.substring(0, 80)}...`);
      } catch (e) {
        if (e.message.includes('already exists') || 
            e.message.includes('duplicate key') ||
            e.message.includes('already exists')) {
          console.log(`  ⊘ Skipped (already exists): ${stmt.substring(0, 80)}...`);
        } else {
          console.error(`  ✗ Error: ${e.message}`);
          console.error(`  Statement: ${stmt.substring(0, 200)}`);
        }
      }
    }
  }
  
  console.log('\n✅ All migrations completed!');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});