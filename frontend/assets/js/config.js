// ==========================
//  Configuración API Backend
// ==========================

// URL del backend desplegado en Railway
// Cambia esto cuando despliegues el backend en Railway
const API_CONFIG = {
  // Para desarrollo local (cuando el backend corre en tu computadora)
  // baseURL: 'http://localhost:8000',
  
  // Para producción (cuando despliegues el backend en Railway)
  // Reemplaza con tu URL de Railway cuando la tengas
  baseURL: 'http://localhost:8000',  // Cambiar por la URL de Railway más adelante
  
  endpoints: {
    usuarios: '/usuarios',
    reservas: '/reservas',
    servicios: '/servicios',
    empleados: '/empleados',
    contacto: '/contacto',
  }
};

// Función helper para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en la petición');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en la API:', error);
    throw error;
  }
}

// Exportar para uso en otros archivos
window.API_CONFIG = API_CONFIG;
window.apiRequest = apiRequest;
