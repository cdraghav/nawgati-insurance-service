import { createError } from '../../../utils';
import { updateUser } from './dbUtils';

const updateProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (req.user.userId !== userId && !req.user.isSuperUser) {
      throw createError(403, 'forbidden');
    }

    const { first_name, last_name, phone, picture_url } = req.body;
    const updated = await updateUser(userId, { first_name, last_name, phone, picture_url });

    if (!updated) throw createError(400, 'no valid fields to update');

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export default updateProfile;
