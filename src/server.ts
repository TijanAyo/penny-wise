import "reflect-metadata";

import * as dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";

import { connectDB, isLocal, allowedOrigins, environment } from "./config";
import { authRoute, walletRoute } from "./routes";

const app: Express = express();
const PORT = Number(environment.PORT) || 3333;

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));

// Define Routes
app.use("/api/auth", authRoute);
app.use("/api/wallet", walletRoute);

app.get("/", (_req: Request, res: Response) => {
  return res
    .status(200)
    .json({ data: null, message: "Server up and running 🚀🚀", success: true });
});

app.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({
    data: null,
    message: "Server is healthy and running smoothly 🏃🏾🏃🏾",
    success: true,
  });
});

// 404 Route
app.all("*", (_req: Request, res: Response) => {
  return res.status(404).json({
    data: "NOT_FOUND_ERROR",
    message: "Route does not exist, check provided endpoint and try again",
    success: false,
  });
});

const startServer = async () => {
  try {
    // DB Config
    await connectDB();
    app.listen(PORT, () => {
      isLocal
        ? console.info(`Server running on http://localhost:${PORT}`)
        : console.info(`Server running on prod`);
    });
  } catch (err: any) {
    console.error(`Failed to connect to the database: ${err.message}`);
    process.exit(1);
  }
};

startServer();
