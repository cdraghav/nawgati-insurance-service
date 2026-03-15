import _ from 'lodash';
import { obfuscatePhone, obfuscateVehicle } from '../../../utils';
import { getLeadsByVisitIds, getVisitIdsByAssignee } from '../leads/dbUtils';
import { getVisits as fetchVisits } from './dbUtils';

const getVisits = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(_.get(req.query, 'page', 1), 10));
    const limit = Math.min(100, Math.max(1, parseInt(_.get(req.query, 'limit', 20), 10)));

    const timeRange = ['today', 'thisWeek', 'allTime'].includes(req.query.timeRange)
      ? req.query.timeRange
      : 'allTime';
    const vehicleType = req.query.vehicleType || null;
    const regType = req.query.regType || null;
    const insuranceExpiryFrom = req.query.insuranceExpiryFrom || null;
    const insuranceExpiryTo = req.query.insuranceExpiryTo || null;
    const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo, 10) : null;

    const filterVisitIds = assignedTo ? await getVisitIdsByAssignee(assignedTo) : null;

    if (filterVisitIds !== null && filterVisitIds.length === 0) {
      return res.json({ visits: [], page, limit });
    }

    const visits = await fetchVisits({
      skip: (page - 1) * limit,
      limit,
      timeRange,
      vehicleType,
      regType,
      insuranceExpiryFrom,
      insuranceExpiryTo,
      visitIds: filterVisitIds,
    });

    const visitIds = visits.map((v) => v.id);
    const leadAssignments = await getLeadsByVisitIds(visitIds);
    const assignmentMap = _.keyBy(leadAssignments, 'visit_id');

    const result = visits.map((v) => {
      const lead = assignmentMap[v.id];
      const isClaimedByOther = lead && lead.assigned_to !== null && lead.assigned_to !== req.user.userId;
      return {
        id: v.id,
        timestamp: v.timestamp,
        vehicleNumber: obfuscateVehicle(v.vehicleNumber),
        vehicleType: v.vehicleType,
        isCommercial: v.isCommercial,
        area: v.area,
        insuranceExpiry: v.insuranceExpiry,
        phoneNumber: obfuscatePhone(v.phoneNumber),
        isAssigned: !!lead,
        isAssignedToMe: !!lead && !isClaimedByOther,
        isClaimable: !isClaimedByOther,
        assignedTo: lead?.first_name ? { firstName: lead.first_name, lastName: lead.last_name } : null,
      };
    });

    res.json({ visits: result, page, limit });
  } catch (err) {
    next(err);
  }
};

export default getVisits;
