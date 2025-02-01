import mongoose, { ConnectOptions } from 'mongoose';

mongoose.Promise = global.Promise;

const { MONGO_URI, MONGO_DB_NAME } = process.env;

const connectToDatabase = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  const options: ConnectOptions = { dbName: MONGO_DB_NAME };

  try {
    await mongoose.connect(MONGO_URI, options);
    console.log('✅ MongoDB connection successful!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1); // Exit the process if connection fails
  }
};

export { connectToDatabase };
