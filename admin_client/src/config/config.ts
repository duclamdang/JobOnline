const config = {
  appName: import.meta.env.VITE_APP_NAME as string,
  apiUrl: import.meta.env.VITE_BACKEND_URL as string,
  storageUrl: "http://192.168.37.1:8000/storage",   
};

export default config;