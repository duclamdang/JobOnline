import config from "@config/config";
import axios from "axios";

export const api = axios.create({
  baseURL: `${config.apiUrl}/api`,
  headers: { "Content-Type": "application/json" },
});

export const apiAuth = axios.create({
  baseURL: `${config.apiUrl}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
let userAccessToken: string | null = null;
let adminAccessToken: string | null = null;

export const setUserAccessToken = (token: string | null) => {
  userAccessToken = token;
};
export const setAdminAccessToken = (token: string | null) => {
  adminAccessToken = token;
};

apiAuth.interceptors.request.use((cfg) => {
  const path = window.location.pathname;
  cfg.headers = cfg.headers ?? {};
  if (path.startsWith("/admin")) {
    if (adminAccessToken) {
      cfg.headers.Authorization = `Bearer ${adminAccessToken}`;
    }
  }
  else {
    if (userAccessToken) {
      cfg.headers.Authorization = `Bearer ${userAccessToken}`;
    }
  }

  return cfg;
});