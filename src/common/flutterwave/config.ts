import { environment } from "../../config";
import axios from "axios";

const FLUTTERWAVE_BASE_URL = `https://api.flutterwave.com/v3`;
const FLUTTERWAVE_SECRET_HASH = environment.FLUTTERWAVE_SECRET_HASH;
const FLUTTERWAVE_HEADER_CONFIG = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${environment.FLUTTERWAVE_SECRET_KEY}`,
};
const FLUTTERWAVE_CLIENT = axios.create({
  baseURL: FLUTTERWAVE_BASE_URL,
  headers: FLUTTERWAVE_HEADER_CONFIG,
});

export {
  FLUTTERWAVE_BASE_URL,
  FLUTTERWAVE_SECRET_HASH,
  FLUTTERWAVE_HEADER_CONFIG,
  FLUTTERWAVE_CLIENT,
};
