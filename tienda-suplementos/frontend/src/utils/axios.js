/**
 * Re-export de la instancia centralizada de Axios desde services/api.js.
 * Todos los archivos que importan desde 'utils/axios' usan la misma
 * instancia, baseURL, interceptores y configuración.
 *
 * NOTA: Para nuevas importaciones, preferir:
 *   import api from '../services/api';
 */
import api from '../services/api';
export default api;
