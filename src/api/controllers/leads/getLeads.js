import _ from 'lodash';
import { getLeadsByUser } from './dbUtils';

const getLeads = async (req, res, next) => {
  try {
    const page = parseInt(_.get(req.query, 'page', 1), 10);
    const limit = parseInt(_.get(req.query, 'limit', 20), 10);
    const { status } = req.query;

    const { rows, total } = await getLeadsByUser({
      userId: req.user.userId,
      status,
      limit,
      offset: (page - 1) * limit,
    });

    const leads = rows.map((l) => ({
      id: l.id,
      visitId: l.visit_id,
      vehicleNumber: l.vehicle_number,
      vehiclePhone: l.vehicle_phone,
      status: l.status,
      convertedAt: l.converted_at,
      createdAt: l.created_at,
      assignedTo: l.first_name ? { firstName: l.first_name, lastName: l.last_name } : null,
    }));

    res.json({ leads, total, page, limit });
  } catch (err) {
    next(err);
  }
};

export default getLeads;
