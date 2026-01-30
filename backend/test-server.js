import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting test...');
console.log('MONGO_URI:', process.env.MONGO_URI);

try {
  console.log('Attempting to connect to MongoDB...');
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  console.log('Connection successful!');
  process.exit(0);
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error('Full error:', error);
  process.exit(1);
}
