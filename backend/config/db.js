const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Production: must have a valid MONGO_URI — fail fast if missing
    if (process.env.NODE_ENV === 'production') {
      if (!uri) {
        console.error('FATAL: MONGO_URI environment variable is required in production.');
        process.exit(1);
      }
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    // Development: try local MongoDB, then fall back to in-memory
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      try {
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (localErr) {
        console.log('Local MongoDB not available, starting in-memory MongoDB...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
