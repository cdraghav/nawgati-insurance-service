import _ from 'lodash';
import { db } from '../../../db';

const createUser = async ({ first_name, last_name, email, password_hash, phone, picture_url }) => {
  const result = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, picture_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, first_name, last_name, email, role, phone, picture_url, created_at`,
    [first_name, last_name, email, password_hash, phone || null, picture_url || null]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, first_name, last_name, email, password_hash, role, phone, picture_url, is_blocked, is_deleted
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

const getUserById = async (id) => {
  const result = await db.query(
    `SELECT id, first_name, last_name, email, role, phone, picture_url, is_super_user, created_at
     FROM users WHERE id = $1 AND is_deleted = false`,
    [id]
  );
  return result.rows[0] || null;
};

const updateUser = async (id, updates) => {
  const allowed = ['first_name', 'last_name', 'phone', 'picture_url'];
  const fields = _.pick(updates, allowed);
  if (Object.keys(fields).length === 0) return null;

  const setClauses = Object.keys(fields).map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = [...Object.values(fields), id];

  const result = await db.query(
    `UPDATE users SET ${setClauses}, updated_at = NOW()
     WHERE id = $${values.length} AND is_deleted = false
     RETURNING id, first_name, last_name, email, role, phone, picture_url, updated_at`,
    values
  );
  return result.rows[0] || null;
};

const getAgents = async () => {
  const result = await db.query(
    `SELECT id, first_name, last_name, email, picture_url
     FROM users WHERE is_deleted = false AND is_blocked = false
     ORDER BY first_name, last_name`
  );
  return result.rows;
};

export { createUser, getUserByEmail, getUserById, updateUser, getAgents };
