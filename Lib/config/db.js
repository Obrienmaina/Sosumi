// Lib/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Add this log for debugging to confirm the value is picked up
    console.log('DB_CONNECTION_STRING (from db.js):', process.env.DB_CONNECTION_STRING);

   
    await mongoose.connect(
      process.env.DB_CONNECTION_STRING, 
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Connected to MongoDB Atlas (sosumi-blog)');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;