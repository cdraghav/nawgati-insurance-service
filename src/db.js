import { Pool } from 'pg';

const pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } } : undefined);

const getClient_ = async (p) => {
  const client = await p.connect();
  const query = client.query;
  const release = client.release;
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};

const db = {
  query: async (text, params) => {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      err.type = 'POSTGRESQL_ERROR';
      throw err;
    }
  },
  getClient: async () => getClient_(pool),
};

export { db };
