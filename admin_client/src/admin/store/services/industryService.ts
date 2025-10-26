import { apiAuth } from "../../../services/api";

export const getIndustriesApi = async () => {
  const res = await apiAuth.get("/catalogs/industries", { withCredentials: true });
  return res.data.data;
};
