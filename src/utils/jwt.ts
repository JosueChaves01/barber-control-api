import jwt from 'jsonwebtoken';
import { jwtConfig } from '@config/jwt';
import { JwtPayload } from '@types';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
};

