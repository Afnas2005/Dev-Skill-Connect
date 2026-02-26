import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.warn(
        "[DB] MONGO_URI not set. Using in-memory mode - data will NOT persist"
      );
      return;
    }

    console.log("[DB] Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("[DB] ✅ MongoDB connected:", conn.connection.host);
  } catch (error: any) {
    console.error(
      "[DB] ❌ MongoDB connection failed:",
      error?.message || error
    );
    console.warn(
      "[DB] Continuing without database - some features may not work"
    );
    // Don't throw - let the app continue in memory mode
  }
};