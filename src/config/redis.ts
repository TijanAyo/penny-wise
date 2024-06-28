import { createClient } from "redis";
import { environment } from "./environment";

const redisClient = createClient({
  password: environment.REDIS_PASSWORD,
  socket: {
    host: environment.REDIS_HOST,
    port: Number(environment.REDIS_PORT),
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
