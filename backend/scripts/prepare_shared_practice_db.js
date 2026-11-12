import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pg from 'pg';
import pgPromise from 'pg-promise';

const { Client } = pg;
const pgp = pgPromise();
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(scriptDirectory, '../.env') });

const sourceDatabase = process.env.DB_SOURCE_NAME || 'GestHor';
const sharedDatabase = process.env.SHARED_DB_NAME || 'GestHor_Practica_Compartida';
const testPassword = process.env.PRACTICE_TEST_PASSWORD;
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: {
        ...process.env,
        PGPASSWORD: dbConfig.password,
      },
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });
    let stderr = '';

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} terminó con código ${code}: ${stderr.trim()}`));
      }
    });
  });
}

async function connectTo(database) {
  const client = new Client({ ...dbConfig, database });
  await client.connect();
  return client;
}

async function verifyEmptySchema(client) {
  const requiredTables = [
    'roles',
    'permisos',
    'rol_permisos',
    'usuarios',
    'profesores',
    'profesor_preferencias',
  ];
  const tableResult = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  const tableNames = tableResult.rows.map(row => row.tablename);
  const missingTables = requiredTables.filter(table => !tableNames.includes(table));

  if (missingTables.length > 0) {
    throw new Error(`El esquema restaurado no contiene las tablas requeridas: ${missingTables.join(', ')}`);
  }

  const counts = [];
  for (const tableName of tableNames) {
    const result = await client.query(`SELECT count(*)::bigint AS row_count FROM public.${pgp.as.name(tableName)}`);
    counts.push({ table: tableName, rows: Number(result.rows[0].row_count) });
  }

  const populatedTables = counts.filter(({ rows }) => rows !== 0);
  if (populatedTables.length > 0) {
    throw new Error(`La restauración de esquema contiene registros: ${JSON.stringify(populatedTables)}`);
  }

  const metadata = await client.query(`
    SELECT
      (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') AS tables,
      (SELECT count(*) FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public') AS constraints,
      (SELECT count(*) FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public') AS indexes,
      (SELECT count(*) FROM pg_class s
        JOIN pg_namespace n ON n.oid = s.relnamespace
        WHERE n.nspname = 'public' AND s.relkind = 'S') AS sequences
  `);

  const result = metadata.rows[0];
  if (
    Number(result.tables) === 0
    || Number(result.constraints) === 0
    || Number(result.indexes) === 0
    || Number(result.sequences) === 0
  ) {
    throw new Error('La verificación del esquema no encontró tablas, restricciones, índices o secuencias.');
  }

  return {
    tables: Number(result.tables),
    constraints: Number(result.constraints),
    indexes: Number(result.indexes),
    sequences: Number(result.sequences),
  };
}

async function insertPracticeFixtures(client) {
  const passwordHash = await bcrypt.hash(testPassword, 10);

  await client.query('BEGIN');
  try {
    const adminRole = await client.query(`
      INSERT INTO public.roles (nombre_rol, descripcion, activo)
      VALUES ('administrador', 'Administrador ficticio para pruebas de práctica', TRUE)
      RETURNING rol_id
    `);
    const professorRole = await client.query(`
      INSERT INTO public.roles (nombre_rol, descripcion, activo)
      VALUES ('profesor', 'Profesor ficticio para pruebas de práctica', TRUE)
      RETURNING rol_id
    `);

    const readPermission = await client.query(`
      INSERT INTO public.permisos (clave, nombre, descripcion, activo)
      VALUES ('editores:leer', 'Consultar preferencias', 'Acceso de lectura para pruebas de práctica', TRUE)
      RETURNING permiso_id
    `);
    const editPermission = await client.query(`
      INSERT INTO public.permisos (clave, nombre, descripcion, activo)
      VALUES ('editores:editar', 'Editar preferencias', 'Acceso de escritura para pruebas de práctica', TRUE)
      RETURNING permiso_id
    `);

    await client.query(`
      INSERT INTO public.rol_permisos (rol_id, permiso_id)
      VALUES ($1, $2), ($1, $3)
    `, [adminRole.rows[0].rol_id, readPermission.rows[0].permiso_id, editPermission.rows[0].permiso_id]);

    const admin = await client.query(`
      INSERT INTO public.usuarios
        (email, password, password_hash, nombre, rol_id, activo, email_verificado)
      VALUES
        ('practice.admin@unach.test', $1, $1, 'Administrador de práctica', $2, TRUE, TRUE)
      RETURNING usuario_id
    `, [passwordHash, adminRole.rows[0].rol_id]);
    const professor = await client.query(`
      INSERT INTO public.usuarios
        (email, password, password_hash, nombre, rol_id, activo, email_verificado)
      VALUES
        ('practice.profesor@unach.test', $1, $1, 'Profesor de práctica', $2, TRUE, TRUE)
      RETURNING usuario_id
    `, [passwordHash, professorRole.rows[0].rol_id]);

    const professorId = professor.rows[0].usuario_id;
    await client.query(`
      INSERT INTO public.profesores (profesor_id, nombres, apellidos, matricula, email)
      VALUES ($1, 'Profesor', 'Prueba', 'PRACTICA-0001', 'practice.profesor@unach.test')
    `, [professorId]);
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('public.profesores', 'profesor_id'),
        (SELECT max(profesor_id) FROM public.profesores),
        TRUE
      )
    `);

    await client.query('COMMIT');
    return {
      adminId: admin.rows[0].usuario_id,
      professorId,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  if (!dbConfig.user || !dbConfig.password) {
    throw new Error('DB_USER y DB_PASSWORD deben estar configuradas localmente.');
  }
  if (!testPassword || testPassword.length < 16) {
    throw new Error('Configura PRACTICE_TEST_PASSWORD con al menos 16 caracteres fuera del repositorio.');
  }
  if (!/^[A-Za-z][A-Za-z0-9_]{0,62}$/.test(sharedDatabase)) {
    throw new Error('SHARED_DB_NAME debe ser un identificador PostgreSQL válido de hasta 63 caracteres.');
  }
  if (sourceDatabase === sharedDatabase) {
    throw new Error('La base compartida debe tener un nombre distinto al de la base fuente.');
  }

  const maintenanceClient = await connectTo('postgres');
  let dumpPath;
  try {
    const roleResult = await maintenanceClient.query(`
      SELECT rolcreatedb, rolsuper
      FROM pg_roles
      WHERE rolname = current_user
    `);
    if (!roleResult.rows[0] || (!roleResult.rows[0].rolcreatedb && !roleResult.rows[0].rolsuper)) {
      throw new Error('El usuario configurado en DB_USER no tiene permiso para crear bases de datos.');
    }

    const databases = await maintenanceClient.query(
      'SELECT datname FROM pg_database WHERE datname = ANY($1)',
      [[sourceDatabase, sharedDatabase]],
    );
    const existingNames = new Set(databases.rows.map(row => row.datname));
    if (!existingNames.has(sourceDatabase)) {
      throw new Error(`No existe la base fuente configurada: ${sourceDatabase}.`);
    }
    if (existingNames.has(sharedDatabase)) {
      throw new Error(`La base destino ${sharedDatabase} ya existe; no se modificó ni eliminó.`);
    }

    dumpPath = path.join(os.tmpdir(), `gesthor-schema-${randomUUID()}.sql`);
    await runCommand(process.env.PG_DUMP_BIN || 'pg_dump', [
      '--schema-only',
      '--no-owner',
      '--no-acl',
      '--format=plain',
      '--no-password',
      '--host', dbConfig.host,
      '--port', String(dbConfig.port),
      '--username', dbConfig.user,
      '--dbname', sourceDatabase,
      '--file', dumpPath,
    ]);

    const schemaDump = await readFile(dumpPath, 'utf8');
    if (/^COPY\s+(?:public\.)?/mi.test(schemaDump)) {
      throw new Error('El dump contiene instrucciones COPY; se canceló para evitar copiar registros.');
    }

    await maintenanceClient.query(
      `CREATE DATABASE ${quoteIdentifier(sharedDatabase)} WITH TEMPLATE template0 ENCODING 'UTF8'`,
    );
  } finally {
    await maintenanceClient.end();
  }

  try {
    await runCommand(process.env.PSQL_BIN || 'psql', [
      '--no-password',
      '--set', 'ON_ERROR_STOP=1',
      '--host', dbConfig.host,
      '--port', String(dbConfig.port),
      '--username', dbConfig.user,
      '--dbname', sharedDatabase,
      '--file', dumpPath,
    ]);

    const targetClient = await connectTo(sharedDatabase);
    try {
      const schemaStats = await verifyEmptySchema(targetClient);
      const fixtureIds = await insertPracticeFixtures(targetClient);
      console.log(JSON.stringify({
        sourceDatabase,
        sharedDatabase,
        schemaStats,
        allTablesWereEmptyBeforeFixtures: true,
        fixtureCounts: {
          roles: 2,
          permissions: 2,
          users: 2,
          professors: 1,
        },
        fixtureIds,
      }, null, 2));
    } finally {
      await targetClient.end();
    }
  } finally {
    if (dumpPath) {
      await unlink(dumpPath).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }
}

main().catch(error => {
  console.error(`No se pudo preparar la base compartida: ${error.message}`);
  process.exitCode = 1;
});
