import { createError, obfuscatePhone, obfuscateVehicle } from '../../../utils';
import { getLeadByVisitId } from '../leads/dbUtils';
import { getVisitById } from './dbUtils';

const getVisit = async (req, res, next) => {
  try {
    const { visitId } = req.params;

    const visit = await getVisitById(visitId);
    if (!visit) throw createError(404, 'visit not found');

    const lead = await getLeadByVisitId(visitId);
    const isClaimedByOther = lead && lead.assigned_to !== null && lead.assigned_to !== req.user.userId;

    res.json({
      id: visit.id,
      timestamp: visit.timestamp,
      vehicleNumber: obfuscateVehicle(visit.vehicleNumber),
      vehicleType: visit.vehicleType,
      isCommercial: visit.isCommercial,
      area: visit.area,
      insuranceExpiry: visit.insuranceExpiry,
      phoneNumber: obfuscatePhone(visit.phoneNumber),
      isAssigned: !!lead,
      isAssignedToMe: !!lead && !isClaimedByOther,
      isClaimable: !isClaimedByOther,
      assignedTo: lead?.first_name ? { firstName: lead.first_name, lastName: lead.last_name } : null,
    });
  } catch (err) {
    next(err);
  }
};

export default getVisit;
