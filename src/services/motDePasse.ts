import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const hacherMotDePasse = async (motDePasse: string) => {
  const sel = randomBytes(16).toString('hex');
  const hash = scryptSync(motDePasse, sel, 64).toString('hex');
  return `${sel}:${hash}`;
};

export const comparerMotDePasse = async (
  motDePasse: string,
  hashComplet: string,
) => {
  const [sel, hash] = hashComplet.split(':');
  if (!sel || !hash) return false;
  const hashTest = scryptSync(motDePasse, sel, 64).toString('hex');
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashTest, 'hex'));
};
