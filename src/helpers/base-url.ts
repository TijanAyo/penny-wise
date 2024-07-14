import { environment } from "../config";

const BASE_URL = environment.BASE_URL;
const NODE_ENV = environment.NODE_ENV;
const PORT = environment.PORT;
const LOCAL_URL = `http://localhost:${PORT}`;

export const URL = NODE_ENV == "local" ? BASE_URL : LOCAL_URL;
