import { db } from '../../../db';

const createLead = async (client, { visit_id, vehicle_number, vehicle_phone, assigned_to }) => {
  const result = await client.query(
    `INSERT INTO leads (visit_id, vehicle_number, vehicle_phone, assigned_to, status)
     VALUES ($1, $2, $3, $4, 'assigned')
     RETURNING *`,
    [visit_id, vehicle_number, vehicle_phone || null, assigned_to]
  );
  return result.rows[0];
};

const getLeadByVisitId = async (visit_id) => {
  const result = await db.query(
    `SELECT l.*, u.first_name, u.last_name FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     WHERE l.visit_id = $1`,
    [visit_id]
  );
  return result.rows[0] || null;
};

const getLeadById = async (id) => {
  const result = await db.query(
    `SELECT l.*, u.first_name, u.last_name FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     WHERE l.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const getLeadByPartnerLeadId = async (partner_lead_id) => {
  const result = await db.query('SELECT * FROM leads WHERE partner_lead_id = $1', [partner_lead_id]);
  return result.rows[0] || null;
};

const getLeadsByUser = async ({ userId, status, limit, offset }) => {
  const params = [userId];
  let where = 'l.assigned_to = $1';

  if (status) {
    params.push(status);
    where += ` AND l.status = $${params.length}`;
  }

  params.push(limit, offset);

  const [rowsResult, countResult] = await Promise.all([
    db.query(
      `SELECT l.*, u.first_name, u.last_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE ${where}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    db.query(
      `SELECT COUNT(*) FROM leads WHERE assigned_to = $1${status ? ' AND status = $2' : ''}`,
      status ? [userId, status] : [userId]
    ),
  ]);

  return { rows: rowsResult.rows, total: parseInt(countResult.rows[0].count, 10) };
};

const updateLeadStatus = async (client, id, status) => {
  const result = await client.query(
    `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

const updateLeadConvertedAt = async (client, id, status, convertedAt) => {
  const result = await client.query(
    `UPDATE leads SET status = $1, converted_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
    [status, convertedAt, id]
  );
  return result.rows[0];
};

const setLeadPartnerInfo = async (leadId, partnerLeadId) => {
  const result = await db.query(
    `UPDATE leads SET partner_lead_id = $1, partner_notified_at = NOW(), updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [partnerLeadId, leadId]
  );
  return result.rows[0];
};

const getLeadsByVisitIds = async (visitIds) => {
  if (!visitIds.length) return [];
  const result = await db.query(
    `SELECT l.visit_id, l.assigned_to, u.first_name, u.last_name FROM leads l
     LEFT JOIN users u ON l.assigned_to = u.id
     WHERE l.visit_id = ANY($1)`,
    [visitIds]
  );
  return result.rows;
};

const createLeadStatusHistory = async (client, { lead_id, changed_by, from_status, to_status, note }) => {
  const result = await client.query(
    `INSERT INTO lead_status_history (lead_id, changed_by, from_status, to_status, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [lead_id, changed_by || null, from_status || null, to_status, note || null]
  );
  return result.rows[0];
};

const getVisitIdsByAssignee = async (userId) => {
  const result = await db.query(
    `SELECT visit_id FROM leads WHERE assigned_to = $1`,
    [userId]
  );
  return result.rows.map((r) => r.visit_id);
};

export {
  createLead,
  getLeadByVisitId,
  getLeadById,
  getLeadByPartnerLeadId,
  getLeadsByUser,
  getLeadsByVisitIds,
  getVisitIdsByAssignee,
  updateLeadStatus,
  updateLeadConvertedAt,
  setLeadPartnerInfo,
  createLeadStatusHistory,
};
