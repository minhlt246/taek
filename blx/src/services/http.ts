import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const http = axios.create({
  baseURL,
  timeout: 15000,
});

export default http;
