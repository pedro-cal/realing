import type { RedisOptions } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConnectionOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
};
