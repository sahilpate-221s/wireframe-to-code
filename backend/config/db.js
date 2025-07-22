import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/wireframe";

if (!MONGODB_URL) {
  throw new Error('MONGODB_URL environment variable is not defined');
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

export default connectDB;
