import _ from 'lodash';
import axios from 'axios';
import { db } from '../../../db';
import { createError } from '../../../utils';
import { getLeadByVisitId, createLead, createLeadStatusHistory, setLeadPartnerInfo } from './dbUtils';
import { getVisitById } from '../visits/dbUtils';

const shapeLeadResponse = (lead, visit) => ({
  id: lead.id,
  visitId: lead.visit_id,
  vehicleNumber: lead.vehicle_number,
  vehiclePhone: lead.vehicle_phone,
  status: lead.status,
  assignedTo: lead.first_name ? { firstName: lead.first_name, lastName: lead.last_name } : null,
  visit,
});

const notifyPartner = async (lead, user) => {
  try {
    const response = await axios.post(
      `${process.env.PARTNER_API_URL}/leads`,
      { lead_id: lead.id, vehicle_number: lead.vehicle_number, agent_id: user.userId, agent_email: user.email },
      { headers: { 'x-api-key': process.env.PARTNER_API_KEY } }
    );
    const partnerLeadId = _.get(response, 'data.lead_id') || _.get(response, 'data.id');
    if (partnerLeadId) await setLeadPartnerInfo(lead.id, String(partnerLeadId));
  } catch (err) {
    console.error('Partner notification failed', err.message);
  }
};

const revealLead = async (req, res, next) => {
  try {
    const { visitId } = req.body;
    if (!visitId) throw createError(400, 'visitId is required');

    const existing = await getLeadByVisitId(visitId);
    if (existing) {
      if (existing.assigned_to !== req.user.userId) {
        throw createError(403, 'This lead is assigned to another agent');
      }
      const visit = await getVisitById(visitId);
      return res.json(shapeLeadResponse(existing, visit));
    }

    const visit = await getVisitById(visitId);
    if (!visit) throw createError(404, 'visit not found');

    const client = await db.getClient();
    let newLead;
    try {
      await client.query('BEGIN');
      newLead = await createLead(client, {
        visit_id: visitId,
        vehicle_number: visit.vehicleNumber,
        vehicle_phone: visit.phoneNumber,
        assigned_to: req.user.userId,
      });
      await createLeadStatusHistory(client, {
        lead_id: newLead.id,
        changed_by: req.user.userId,
        from_status: null,
        to_status: 'assigned',
      });
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    notifyPartner(newLead, req.user);

    const fetchedLead = await getLeadByVisitId(visitId);
    res.status(201).json(shapeLeadResponse(fetchedLead, visit));
  } catch (err) {
    next(err);
  }
};

export default revealLead;
