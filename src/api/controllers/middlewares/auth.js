import jwt from 'jsonwebtoken';
import { createError, isUserSuperUser } from '../../../utils';
import { AUTH_TOKENS_SECRET } from '../../../utils/constants';

const ignoredRoutes = ['/users/signin', '/users/signup', '/refresh'];

const auth = async (req, _res, next) => {
  if (ignoredRoutes.includes(req.path)) {
    next();
    return;
  }

  const secret = AUTH_TOKENS_SECRET;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw createError(401, 'no Token Provided');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw createError(401, 'Token Malformed');
    }

    try {
      req.user = jwt.verify(token, secret);
      const isSuperUser = await isUserSuperUser(req.user.userId);
      req.user.isSuperUser = isSuperUser;
    } catch (err) {
      throw createError(401, 'token_expired', 'info');
    }

    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = auth;
