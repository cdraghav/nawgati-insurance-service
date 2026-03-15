import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { AUTH_TOKENS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from './constants';

const createError = (...args) => {
  const status = _.get(args, 0, 500);
  const message = _.get(args, 1, 'Internal Server Error');
  const level = _.get(args, 2, 'error');
  const extra = _.get(args, 3);

  if (status instanceof Error) return status;

  const error = new Error(message);
  error.status = status;
  error.name = level;
  error.extra = extra;
  return error;
};

const isUserSuperUser = async (_userId) => false;

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    AUTH_TOKENS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
};

const obfuscatePhone = (phone) => (phone ? `XXXXXX${phone.slice(-4)}` : null);
const obfuscateVehicle = (number) => (number ? `XXXXXX${number.slice(-4)}` : null);

export { createError, isUserSuperUser, generateTokens, obfuscatePhone, obfuscateVehicle };
