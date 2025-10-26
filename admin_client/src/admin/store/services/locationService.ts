import { apiAuth } from "../../../services/api";

export const getProvincesApi = async () => {
  const res = await apiAuth.get("/locations/provinces", { withCredentials: true });
  return res.data.data;
};
