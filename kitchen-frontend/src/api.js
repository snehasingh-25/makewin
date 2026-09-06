import axios from "axios";

const rawApi = import.meta.env.VITE_API_URL || "http://localhost:3005";
export const API = rawApi.replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: API,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
