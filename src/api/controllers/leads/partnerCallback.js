import { db } from '../../../db';
import { createError } from '../../../utils';
import { getLeadByPartnerLeadId, updateLeadConvertedAt, createLeadStatusHistory } from './dbUtils';

const partnerCallback = async (req, res, next) => {
  try {
    const callbackSecret = req.headers['x-callback-secret'];
    if (callbackSecret !== process.env.PARTNER_CALLBACK_SECRET) {
      throw createError(401, 'invalid callback secret');
    }

    const { partnerLeadId, status } = req.body;
    if (!partnerLeadId) throw createError(400, 'partnerLeadId is required');
    if (!status) throw createError(400, 'status is required');

    const lead = await getLeadByPartnerLeadId(String(partnerLeadId));
    if (!lead) throw createError(404, 'lead not found');

    const convertedAt = status === 'converted' ? new Date() : null;

    const client = await db.getClient();
    let updatedLead;
    try {
      await client.query('BEGIN');
      updatedLead = await updateLeadConvertedAt(client, lead.id, status, convertedAt);
      await createLeadStatusHistory(client, {
        lead_id: lead.id,
        changed_by: null,
        from_status: lead.status,
        to_status: status,
        note: 'partner callback',
      });
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ success: true, lead: updatedLead });
  } catch (err) {
    next(err);
  }
};

export default partnerCallback;
