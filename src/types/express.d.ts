import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    utilisateur?: {
      id: string;
      roles: string[];
      courriel: string;
      langue?: 'fr' | 'en';
    };
  }
}
