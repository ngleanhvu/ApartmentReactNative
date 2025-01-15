import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const HOST = "http://localhost:8000/";

export const endpoints = {
  login: "/o/token/",
  "current-user": "/users/current-user/",
  "active-user": "/users/active-user/",
  "monthly-fees": "/monthly-fees/",
  transaction: "/transactions/",
  "transaction-detail": (transactionId) =>
    `/transactions/${transactionId}/detail/`,
  fees: "/fees/",
  register: "/vehicle-cards/register/",
  "vehicle-cards": "/vehicle-cards/users/",
  "current-user": "/users/current-user/",
  notification: "/notifications/",
  "notification-detail": (id) => `/notifications/${id}/`,
};

export const authApis = (token) => {
  console.info(token);
  return axios.create({
    baseURL: HOST,
    headers: {
      Authorization: `Bearer ${
        token === null ? AsyncStorage.getItem("access_token") : token
      }`,
    },
  });
};

export default axios.create({
  baseURL: HOST,
  maxRedirects: 5,
});
