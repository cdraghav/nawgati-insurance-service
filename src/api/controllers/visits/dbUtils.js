import dayjs from 'dayjs';
import mongoose from 'mongoose';

mongoose.models.intraStation || mongoose.model('intraStation', new mongoose.Schema({}, { strict: false, collection: 'intrastations' }));

const VisitSchema = new mongoose.Schema(
  { station: { type: mongoose.Schema.Types.ObjectId, ref: 'intraStation' } },
  { strict: false, collection: 'visits' }
);
const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

// Only map docs that have all required fields present
const mapVisit = (doc) => {
  if (!doc.regNo || !doc.owner?.mobile || !doc.insurance?.expiryDate) return null;

  return {
    id: doc._id.toString(),
    timestamp: dayjs(doc.servedAt || doc.firstSeenAt || doc.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    vehicleNumber: doc.regNo,
    vehicleType: doc.type || null,
    isCommercial: doc.regType === 'commercial',
    area: doc.station?.district || doc.station?.address || null,
    insuranceExpiry: dayjs(doc.insurance.expiryDate).format('YYYY-MM-DD'),
    insuranceResult: doc.insurance.result || null,
    phoneNumber: doc.owner.mobile,
  };
};

const buildFilter = ({ timeRange, vehicleType, regType, insuranceExpiryFrom, insuranceExpiryTo, visitIds }) => {
  // Base filter: insurance exists and is either expired or expiring within 60 days
  const filter = {
    regNo: { $exists: true, $ne: null },
    'owner.mobile': { $exists: true, $ne: null },
    $or: [
      { 'insurance.result': 'expired' },
      {
        'insurance.expiryDate': {
          $gte: dayjs().toDate(),
          $lte: dayjs().add(60, 'day').toDate(),
        },
      },
    ],
  };

  if (visitIds !== null) {
    filter._id = { $in: visitIds };
  }

  if (timeRange === 'today') {
    filter.servedAt = {
      $gte: dayjs().startOf('day').toDate(),
      $lte: dayjs().endOf('day').toDate(),
    };
  } else if (timeRange === 'thisWeek') {
    filter.servedAt = {
      $gte: dayjs().startOf('week').toDate(),
      $lte: dayjs().toDate(),
    };
  }

  if (vehicleType) filter.type = vehicleType;
  if (regType) filter.regType = regType;

  if (insuranceExpiryFrom || insuranceExpiryTo) {
    filter['insurance.expiryDate'] = {};
    if (insuranceExpiryFrom) filter['insurance.expiryDate'].$gte = dayjs(insuranceExpiryFrom).toDate();
    if (insuranceExpiryTo) filter['insurance.expiryDate'].$lte = dayjs(insuranceExpiryTo).endOf('day').toDate();
  }

  return filter;
};

const getVisits = async ({
  skip = 0,
  limit = 50,
  timeRange = 'allTime',
  vehicleType = null,
  regType = null,
  insuranceExpiryFrom = null,
  insuranceExpiryTo = null,
  visitIds = null,
}) => {
  const filter = buildFilter({ timeRange, vehicleType, regType, insuranceExpiryFrom, insuranceExpiryTo, visitIds });

  const docs = await Visit.find(filter)
    .populate('station', 'district address')
    .sort({ servedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  return docs.map(mapVisit).filter(Boolean);
};

const getVisitById = async (visitId) => {
  const doc = await Visit.findById(visitId).populate('station', 'district address').lean().exec();
  return doc ? mapVisit(doc) : null; // mapVisit also returns null if required fields are missing
};

export { getVisits, getVisitById };