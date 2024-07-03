import { environment } from "./environment";

const REDIS_HOST = environment.REDIS_HOST;
const REDIS_PORT = Number(environment.REDIS_PORT);
const REDIS_PASSWORD = environment.REDIS_PASSWORD;

const queueConfig = {
  redis: { host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD },
  limiter: { max: 5, duration: 1000 },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 3600, // keep failed task up to 24 hours
    },
  },
};

export default queueConfig;
