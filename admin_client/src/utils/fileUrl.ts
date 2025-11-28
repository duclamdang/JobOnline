import config from "@config/config";

export const getFileUrl = (path?: string | null): string => {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = (config.storageUrl || "").replace(/\/+$/, "");
  const cleaned = path.replace(/^\/+/, "");

  return base ? `${base}/${cleaned}` : cleaned;
};
