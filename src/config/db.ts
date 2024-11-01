import mongoose from "mongoose";

const isLocal = String(process.env.NODE_ENV) === "staging";
const url = isLocal
  ? String(process.env.STAGING_MONGO_URI)
  : String(process.env.PRODUCTION_MONGO_URI) || "";

const connectDB = async (): Promise<void> => {
  try {
    const connectionMessage: string = isLocal
      ? "Local 🛠️🛠️"
      : "Production 🌐🚀";
    await mongoose.connect(url);
    console.info(`Connected to MongoDB ${connectionMessage}`);
  } catch (err: any) {
    console.error(`Error connecting to mongodb ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Shutting down gracefully...");

  // Close the MongoDB connection
  await mongoose.connection.close();

  console.log("Graceful shutdown complete");
  process.exit(0);
};

// Handle termination signals for graceful shutdown
process.on("SIGINT", gracefulShutdown).on("SIGTERM", gracefulShutdown);

export { isLocal, connectDB };
