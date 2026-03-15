import { db } from '../../../db';
import { createError } from '../../../utils';
import { getLeadById, updateLeadStatus as updateStatus, createLeadStatusHistory } from './dbUtils';

const VALID_STATUSES = ['assigned', 'contacted', 'converted', 'lost'];

const updateLeadStatus = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { status, note } = req.body;

    if (!status) throw createError(400, 'status is required');
    if (!VALID_STATUSES.includes(status)) throw createError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);

    const lead = await getLeadById(leadId);
    if (!lead) throw createError(404, 'lead not found');

    if (lead.assigned_to !== req.user.userId && !req.user.isSuperUser) {
      throw createError(403, 'forbidden');
    }

    const client = await db.getClient();
    let updatedLead;
    try {
      await client.query('BEGIN');
      updatedLead = await updateStatus(client, leadId, status);
      await createLeadStatusHistory(client, {
        lead_id: leadId,
        changed_by: req.user.userId,
        from_status: lead.status,
        to_status: status,
        note,
      });
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json(updatedLead);
  } catch (err) {
    next(err);
  }
};

export default updateLeadStatus;
