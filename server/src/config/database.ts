import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const DatabaseConnection = new DataSource({
  type: process.env.DB_TYPE === 'mongodb' ? 'mongodb' : 'sqlite',
  database: process.env.DB_DATABASE || './abyssal.db',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../features/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/../subscribers/*{.ts,.js}'],
});