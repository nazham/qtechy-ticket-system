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
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred during database connection");
    }
    process.exit(1);
  }
};

export default connectDB;
