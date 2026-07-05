import mongoose from 'mongoose';

// Serverless platforms (Vercel) can spin up many concurrent function
// instances under bursty traffic; each cold start that calls
// mongoose.connect() unconditionally opens a brand-new connection pool.
// Without caching, a burst of concurrent requests can open far more
// connections than MongoDB Atlas's (especially the free M0 tier) limit
// allows, and every DB-backed route starts failing at once. Caching the
// connection promise on `global` survives across invocations on a warm
// container and ensures concurrent cold starts share a single in-flight
// connection attempt instead of racing to open their own.
const cached = global._mongooseConn || (global._mongooseConn = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      })
      .catch((err) => {
        // Don't cache a failed attempt — let the next request retry.
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
