require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  // Si existe la variable DATABASE_URL (Docker), la usa. 
  // Si no (Local), usa tu config de siempre.
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/colegio_arbitros'
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