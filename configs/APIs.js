import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const HOST = "http://192.168.1.5:8000/";

export const endpoints = {
  login: "/o/token/",
  "current-user": "/users/current-user/",
  "active-user": "/users/active-user/",
  "monthly-fees": "/monthly-fees/",
  transaction: "/transactions/",
  feedbacks:"/feedbacks/",
  storageLocker:"/storage_lockers/",
  packages : "/packages/",
  surveys : "/surveys/",
  'survey-details': (surveyId) => `/surveys/${surveyId}/`,
  'submit-survey' : (surveyId) => `/surveys/${surveyId}/submit_response/`
};

export const authApis = (token) => {
  console.info(token);
  return axios.create({
    baseURL: HOST,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: HOST,
  maxRedirects: 5,
});
