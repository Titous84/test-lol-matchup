import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/league';
const JWT_SECRET = process.env.JWT_SECRET ?? 'secret-temporaires-matchups';

export const env = {
  port: PORT,
  mongodbUri: MONGODB_URI,
  jwtSecret: JWT_SECRET,
};
