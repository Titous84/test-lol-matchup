import type { Response } from 'express';

export const envoyerErreurValidation = (
  res: Response,
  message = '❌ Données invalides.',
  details?: unknown,
) => {
  res.status(400).json({
    message,
    details,
  });
};

export const envoyerErreurServeur = (
  res: Response,
  details?: unknown,
  message = '❌ Erreur serveur inattendue.',
) => {
  res.status(500).json({
    message,
    details,
  });
};
