import mongoose from "mongoose";

const config: { [key: string]: { url: string } } = {
  local: {
    url: String(process.env.LOCAL_MONGO_URI),
  },
  staging: {
    url: String(process.env.STAGING_MONGO_URI),
  },
  production: {
    url: String(process.env.PRODUCTION_MONGO_URI),
  },
};

export const env = String(process.env.NODE_ENV) || "production";
const currentConfig = config[env];

const getConnectionMessage = (env: string): string => {
  switch (env) {
    case "local":
      return "Local 💻";
    case "staging":
      return "Staging 🛠️";
    case "production":
      return "Production 🚀";
    default:
      return "Unknown ❓";
  }
};

export const getServerMessage = (env: string, port: number): string => {
  switch (env) {
    case "local":
      return `Server running on http://localhost:${port}`;
    case "staging":
      return `Server running on staging environment - port ${port}`;
    case "production":
      return `Server running on production environment`;
    default:
      return `Server running on unknown environment`;
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    const connectionMessage: string = getConnectionMessage(env);
    await mongoose.connect(currentConfig.url);
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
