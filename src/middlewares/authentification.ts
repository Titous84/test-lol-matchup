import { NextFunction, Request, Response } from 'express';
import { verifierToken as verifierJwt } from '../services/token';

export const verifierToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  try {
    const payload = verifierJwt(token);

    (req as any).utilisateur = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Jeton invalide ou expiré.' });
  }
};
