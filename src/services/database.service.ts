import { Collection, Db, MongoClient, ServerApiVersion, WithId } from 'mongodb';

export class DatabaseService {
  private client: MongoClient;
  private static instance: DatabaseService;
  private db: Db | null = null;
  private dbName: string;
  private uri: string;

  constructor() {
    this.uri = process.env.MONGO_URI || '';
    this.dbName = process.env.MONGO_DB_NAME || '';

    this.client = new MongoClient(this.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect() {
    if (this.db) {
      return this.db;
    }
    try {
      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });
      console.log('Connected to MongoDB successfully!');
      this.db = this.client.db(this.dbName);
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect first.');
    }
    return this.db;
  }

  public async paginate<T extends Document>(
    collection: Collection<T>,
    query: Record<string, any> = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ data: WithId<T>[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;
    const cursor = collection.find(query).skip(skip).limit(pageSize);
    const data = await cursor.toArray();
    const total = await collection.countDocuments(query);

    return {
      data,
      total,
      page,
      pageSize
    };
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }
}
