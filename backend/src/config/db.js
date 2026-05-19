require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/colegio_arbitros',
  // Configuración de seguridad SSL obligatoria para bases de datos en la nube (Render/Supabase)
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log(`Conectado a PostgreSQL en entorno de: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO LOCAL'}`);
});

module.exports = pool;

/*
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'colegio_arbitros',
  password: '123456',
  port: 5432,
});
module.exports = pool;
*/


/*
const { Pool } = require('pg');

const pool = new Pool({
  // En Docker, el host es el nombre del servicio definido en docker-compose (db)
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/colegio_arbitros'
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL');
});

module.exports = pool;
*/