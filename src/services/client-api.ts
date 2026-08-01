import axios from "axios";

/** Instance Axios configurée pour les appels API futurs */
export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_API ?? "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

clientApi.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    // Gestion centralisée des erreurs API
    return Promise.reject(erreur);
  }
);
