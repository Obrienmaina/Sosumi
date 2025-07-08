// Lib/config/db.js
// This file establishes and manages the MongoDB connection using Mongoose.

import mongoose from 'mongoose'; // Use import for ES Modules

const connectDB = async () => {
  // Check if already connected or connecting to prevent multiple connections
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to MongoDB.');
    return;
  }

  try {
    // Log for debugging (optional, remove in production if sensitive)
    // console.log('Attempting to connect to DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

    await mongoose.connect(process.env.DB_CONNECTION_STRING || '', {
      // useNewUrlParser and useUnifiedTopology are deprecated and no longer needed in Mongoose 6+
      // If you are using an older Mongoose version, keep them.
      // For Mongoose 6.x and above, these options are default.
    });
    console.log('Successfully connected to MongoDB Atlas.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // In a serverless environment, throwing an error is often sufficient.
    // Next.js will catch this and handle the response.
    throw new Error('Could not connect to the database.');
  }
};

export default connectDB; // Use export default for ES Modules
