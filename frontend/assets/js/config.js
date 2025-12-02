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
  
  // Obtener token de autenticación
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Agregar token si existe
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Merge headers si vienen en options
  if (options.headers) {
    finalOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }
  
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

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

// Verificar si el usuario está autenticado
function isAuthenticated() {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  return token && user;
}

// Obtener usuario actual
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Exportar funciones de auth
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
