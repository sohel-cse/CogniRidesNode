import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT || 10416)
      },
      database: 0,
    });

    this.client.on('error', err => console.log('Redis Client Error', err));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }

    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('✅ Redis connection successful!');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      process.exit(1);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
