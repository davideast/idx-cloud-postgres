import pg from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';

async function createCloudSQLPool() {
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.DB_INSTANCE_NAME,
    ipType: 'PUBLIC',
  });
  return new pg.Pool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 5,
  });
}

function createLocalPool() {
  return new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    max: 5,
  });
}

async function createDatabasePool() {
  return process.env.MODE === 'dev' ? createLocalPool() : createCloudSQLPool();
}

(async () => {
  try {
    const pool = await createDatabasePool();
    const result = await pool.query(`
    SELECT v.title, v.view_count 
    FROM videos as v
    INNER JOIN channels as c ON c.id = v.channel_id
      WHERE c.title = 'Firebase'
      AND view_count > 10000
    LIMIT 100;`);
    console.table(result.rows); 
  } catch (err) {
    console.error('Database connection error:', err.stack); 
  }
})();
