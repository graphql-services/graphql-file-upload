import { config } from 'dotenv';

config({});

interface IENV {
  PORT: string;
  GRAPHQL_URL: string;
  FILESTORAGE_URL: string;
  HOST_URL: string;
}

export const ENV: IENV = process.env as any;
