import axios from "axios";
const BACKEND_URL = process.env.BACKEND_URL;
const BACKEND_PORT = process.env.BACKEND_PORT;

let backendUrl = `http://${BACKEND_URL}:${BACKEND_PORT}`; // Esto lo deben de modificar (idealmente una variable de entorno)

if (backendUrl && backendUrl.startsWith('"') && backendUrl.endsWith('"')) {
  backendUrl = backendUrl.slice(1, -1);
}

const api = axios.create({
  baseURL: backendUrl,
});

export default api;
