import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
dotenv.config();

const pgp = pgPromise();
const cn = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
    `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const dbConnection = pgp(cn);

async function pruebaConexion() {
    try {
        const fecha = await dbConnection.oneOrNone('SELECT NOW() AS fecha');
        console.log('Prueba de conexión establecida', fecha);
    } catch (error) {
        console.error('Error de conexión a la base de datos:', error);
    }
}

export { dbConnection, pruebaConexion };
