import axios from "axios";

export const API = import.meta.env.VITE_API_URL || "http://localhost:3005";

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
