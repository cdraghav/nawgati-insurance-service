import { createError } from '../../../utils';
import { getLeadById } from './dbUtils';
import { getVisitById } from '../visits/dbUtils';

const getLead = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);

    const lead = await getLeadById(leadId);
    if (!lead) throw createError(404, 'lead not found');

    if (lead.assigned_to !== req.user.userId && !req.user.isSuperUser) {
      throw createError(403, 'forbidden');
    }

    const visit = await getVisitById(lead.visit_id);

    res.json({
      id: lead.id,
      visitId: lead.visit_id,
      vehicleNumber: lead.vehicle_number,
      vehiclePhone: lead.vehicle_phone,
      status: lead.status,
      convertedAt: lead.converted_at,
      createdAt: lead.created_at,
      assignedTo: lead.first_name ? { firstName: lead.first_name, lastName: lead.last_name } : null,
      visit,
    });
  } catch (err) {
    next(err);
  }
};

export default getLead;
