import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../config/env';

const base64Url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64url');

const signer = (contenu: string) =>
  createHmac('sha256', env.jwtSecret).update(contenu).digest('base64url');

export type TokenPayload = {
  id: string;
  roles: string[];
  courriel: string;
  langue?: 'fr' | 'en';
  exp: number;
};

export const genererToken = (payload: Omit<TokenPayload, 'exp'>) => {
  const enTete = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const corps = base64Url(
    JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 8 }),
  );
  const signature = signer(`${enTete}.${corps}`);
  return `${enTete}.${corps}.${signature}`;
};

export const verifierToken = (token: string): TokenPayload => {
  const [enTete, corps, signature] = token.split('.');
  if (!enTete || !corps || !signature) {
    throw new Error('Jeton mal formé');
  }
  const signatureAttendue = signer(`${enTete}.${corps}`);
  const signatureValide = timingSafeEqual(
    Buffer.from(signatureAttendue),
    Buffer.from(signature),
  );
  if (!signatureValide) {
    throw new Error('Signature invalide');
  }
  const payload = JSON.parse(Buffer.from(corps, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Date.now()) {
    throw new Error('Jeton expiré');
  }
  return payload as TokenPayload;
};
