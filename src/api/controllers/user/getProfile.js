import { createError } from '../../../utils';
import { getUserById } from './dbUtils';

const getProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (req.user.userId !== userId && !req.user.isSuperUser) {
      throw createError(403, 'forbidden');
    }

    const user = await getUserById(userId);
    if (!user) throw createError(404, 'user not found');

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export default getProfile;
