// ==========================
//  Configuración API Backend
// ==========================

// URL del backend desplegado en Railway
const API_CONFIG = {
  // Backend LOCAL (Railway está caído)
  baseURL: 'http://localhost:8000',
  
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
  
  // Obtener token de autenticación (unificado con login)
  const token = localStorage.getItem('token');
  
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
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  return token && userId;
}

// Obtener usuario actual
function getCurrentUser() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  
  if (userId && userRole) {
    return {
      id: parseInt(userId),
      nombre: userName || 'Usuario',
      rol: userRole
    };
  }
  return null;
}

// Exportar funciones de auth
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
