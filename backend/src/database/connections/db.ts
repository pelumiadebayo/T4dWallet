import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

    console.log("MongoDB connected");
  } catch (error: any) {
    console.error("Connection failed: ", error.message);
    process.exit(1);
  }
};
