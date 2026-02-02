import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://dafanation999_db_user:21pOZfo7x5pmJQ4o@cluster0.0digr6d.mongodb.net/?appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
