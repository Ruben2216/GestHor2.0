import pgPromise from 'pg-promise';
import { env } from './env.js';

const pgp = pgPromise();

const connectionConfig = {
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  ssl: env.db.ssl,
};

const dbConnection = pgp(connectionConfig);

async function pruebaConexion() {
  try {
    const fecha = await dbConnection.oneOrNone('SELECT NOW() AS fecha');
    console.log('Prueba de conexión establecida', fecha);
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error.message);
  }
}

export { dbConnection, pruebaConexion };
