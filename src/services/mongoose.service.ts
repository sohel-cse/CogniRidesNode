import mongoose from 'mongoose';

export class MongooseService {
  private static instance: MongooseService;

  private constructor(private uri: string) {
    if (!uri) {
      throw new Error('MongoDB URI is required');
    }
  }

  /**
   * Get the singleton instance of MongooseService.
   */
  public static getInstance(uri: string): MongooseService {
    if (!MongooseService.instance) {
      MongooseService.instance = new MongooseService(uri);
    }
    return MongooseService.instance;
  }

  /**
   * Connect to MongoDB using Mongoose.
   */
  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB with Mongoose');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB.
   */
  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }
}
