import { environment } from "../config";

const BASE_URL = environment.BASE_URL;
const NODE_ENV = environment.NODE_ENV;
const PORT = environment.PORT;

export const base_url = () => {
  if (NODE_ENV !== "local") {
    return BASE_URL;
  }
  return `http://localhost:${PORT}`;
};
