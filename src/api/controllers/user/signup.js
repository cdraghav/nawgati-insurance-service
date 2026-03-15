import bcrypt from 'bcryptjs';
import { createError, generateTokens } from '../../../utils';
import { getUserByEmail, createUser } from './dbUtils';

const signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone, picture_url } = req.body;

    if (!first_name) throw createError(400, 'first_name is required');
    if (!last_name) throw createError(400, 'last_name is required');
    if (!email) throw createError(400, 'email is required');
    if (!password) throw createError(400, 'password is required');

    const existing = await getUserByEmail(email);
    if (existing) throw createError(409, 'email already registered');

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ first_name, last_name, email, password_hash, phone, picture_url });
    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

export default signup;
