// Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  // Limpiar localStorage si hay datos corruptos o viejos
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  // Si hay token pero no userId, limpiar todo (datos inconsistentes)
  if (token && !userId) {
    console.log('⚠️ Limpiando localStorage (datos inconsistentes)');
    localStorage.clear();
  }
  
  // Verificar si ya hay sesión activa
  if (typeof isAuthenticated !== 'undefined' && isAuthenticated()) {
    const user = getCurrentUser();
    console.log('✅ Sesión activa detectada:', user);
    // Redirigir según el rol
    if (user && user.rol === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else if (user && user.rol === 'empleado') {
      window.location.href = 'empleado-dashboard.html';
    } else if (user && user.rol) {
      window.location.href = 'cliente-dashboard.html';
    } else {
      // Si no hay rol válido, limpiar
      localStorage.clear();
    }
    return;
  }
  
  console.log('ℹ️ No hay sesión activa, mostrando formulario de login');

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validación básica
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }

    // Mostrar loading
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.disabled = true;

    try {
      // Hacer petición al backend (LOCAL)
      console.log('🔄 Intentando login con:', email);
      
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password
        })
      });

      console.log('📡 Respuesta recibida:', response.status);

      const data = await response.json();
      console.log('📦 Data:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Email o contraseña incorrectos');
      }

      // Guardar token y datos de usuario (nombres unificados con dashboards)
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.nombre);
      localStorage.setItem('userRole', data.user.rol);
      
      console.log('✅ Login exitoso, datos guardados:', {
        userId: data.user.id,
        userName: data.user.nombre,
        userRole: data.user.rol
      });

      // Si marcó "recordarme", guardar en localStorage por más tiempo
      if (remember) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 días
        localStorage.setItem('token_expiry', expiryDate.getTime());
      }

      showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

      // Redirigir según el rol
      setTimeout(() => {
        if (data.user.rol === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else if (data.user.rol === 'empleado') {
          window.location.href = 'empleado-dashboard.html';
        } else {
          window.location.href = 'cliente-dashboard.html';
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Mensaje:', error.message);
      
      let errorMsg = 'Error al conectar con el servidor. ';
      
      if (error.message.includes('Failed to fetch')) {
        errorMsg = '❌ No se puede conectar al servidor. Verifica que el backend esté activo en Railway.';
      } else if (error.message.includes('incorrectos')) {
        errorMsg = '❌ Email o contraseña incorrectos. Verifica tus credenciales.';
      } else {
        errorMsg = error.message;
      }
      
      showError(errorMsg);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
});

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password i');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.classList.remove('fa-eye');
    toggleBtn.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    toggleBtn.classList.remove('fa-eye-slash');
    toggleBtn.classList.add('fa-eye');
  }
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  
  successDiv.style.display = 'none';
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Auto-hide después de 5 segundos
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  const errorDiv = document.getElementById('errorMessage');
  
  errorDiv.style.display = 'none';
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}
