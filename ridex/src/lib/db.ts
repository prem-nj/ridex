import mongoose from "mongoose";

const mongodbURL = process.env.MONGO_URI

if (!mongodbURL) {
     throw new Error("db url not found!")
}

let cached = global.mongooseconn

if (!cached) {
     cached = global.mongooseconn = { conn: null, promise: null };
}

const connectDb = async () => {

     if (cached.conn) {
          return cached.conn
     }

     if (!cached.promise) {
          cached.promise = mongoose.connect(mongodbURL).then(c => c.connection)
     }

     try {
          const conn = await cached.promise
          return conn

     } catch (error) {
          cached.promise = null;

          console.log(error);
          throw error;
          console.log(error)
     }

}

export default connectDb;