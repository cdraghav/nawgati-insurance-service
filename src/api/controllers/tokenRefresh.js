import jwt from 'jsonwebtoken';
import { createError } from '../../utils';
import { AUTH_TOKENS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY } from '../../utils/constants';

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError(400, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      AUTH_TOKENS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.json({ accessToken });
  } catch (err) {
    next(createError(401, 'Invalid refresh token'));
  }
};

export default refresh;
