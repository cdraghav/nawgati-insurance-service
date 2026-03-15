import bcrypt from 'bcryptjs';
import { createError, generateTokens } from '../../../utils';
import { getUserByEmail } from './dbUtils';

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) throw createError(400, 'email is required');
    if (!password) throw createError(400, 'password is required');

    const user = await getUserByEmail(email);
    if (!user || user.is_deleted) throw createError(401, 'invalid credentials');
    if (user.is_blocked) throw createError(403, 'account blocked');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw createError(401, 'invalid credentials');

    const { password_hash, is_deleted, is_blocked, ...safeUser } = user;
    const { accessToken, refreshToken } = generateTokens(safeUser);

    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

export default signin;
