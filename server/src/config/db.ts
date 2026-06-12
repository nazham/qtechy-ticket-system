import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    // Strip $ operators from all query filters globally — prevents NoSQL injection at the Mongoose layer regardless of input source. Safer than HTTP-layer sanitization.
    mongoose.set("sanitizeFilter", true);

    const conn = await mongoose.connect(mongoURI);
    process.stdout.write(`MongoDB Connected: ${conn.connection.host}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    process.stderr.write(`Database Connection Error: ${message}\n`);
    throw error;
  }
};

export default connectDB;
