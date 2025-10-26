import { configureStore } from "@reduxjs/toolkit";
import helloReducer from "@context/hello/helloSlice";
import counterReducer from "@context/counter/counterSlice";
import adminAuthReducer from "@admin/store/redux/authSlice";
import jobReducer from "@admin/store/redux/jobSlice";
import { apiAuth } from "@services/api";
import candidateReducer from "@admin/store/redux/candidateSlice";
import applicationReducer from "@admin/store/redux/applicationSlice";
import companyReducer from "@admin/store/redux/companySlice";
import userReducer from "../admin/store/redux/userSlice";
import adminReducer from "../admin/store/redux/adminSlice";
import locationReducer from "@admin/store/redux/locationSlice";
import industryReducer from "@admin/store/redux/industrySlice";
import profileReducer from "@admin/store/redux/profileSlice";
import dashboardReducer from "@admin/store/redux/dashboardSlice";
import applicantSearchReducer from "@admin/store/redux/applicantsearchSlice";

export const store = configureStore({
  reducer: {
    hello: helloReducer,
    counter: counterReducer,
    auth: adminAuthReducer,
    jobs: jobReducer,
    candidates: candidateReducer,
    applications: applicationReducer,
    company: companyReducer,
    location: locationReducer,
    industry: industryReducer,
    profile: profileReducer,
    user: userReducer,
    admin: adminReducer,
    dashboard: dashboardReducer,
    applicantSearch: applicantSearchReducer,
  },
});

apiAuth.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
