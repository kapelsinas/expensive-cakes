import { Env } from './env.validation';

export type DatabaseConfig = {
  url?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
};

export type AppConfig = {
  nodeEnv: string;
  port: number;
  database: DatabaseConfig;
};

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'nothink_checkout',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
  },
});


