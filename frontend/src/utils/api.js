import axios from "axios";
const BACKEND_URL = "192.168.4.1";
const BACKEND_PORT = 8000;

let backendUrl = `http://${BACKEND_URL}:${BACKEND_PORT}`; // Esto lo deben de modificar (idealmente una variable de entorno)

if (backendUrl && backendUrl.startsWith('"') && backendUrl.endsWith('"')) {
  backendUrl = backendUrl.slice(1, -1);
}

const api = axios.create({
  baseURL: backendUrl,
});

export default api;
