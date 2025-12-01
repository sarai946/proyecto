// Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  // Verificar si ya hay sesión activa
  if (typeof isAuthenticated !== 'undefined' && isAuthenticated()) {
    const user = getCurrentUser();
    // Redirigir según el rol
    if (user.rol === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else if (user.rol === 'empleado') {
      window.location.href = 'empleado-dashboard.html';
    } else {
      window.location.href = 'cliente-dashboard.html';
    }
    return;
  }

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
      // Hacer petición al backend
      const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Guardar token y usuario
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      
      // Obtener información del usuario
      const userResponse = await fetch(`${API_CONFIG.baseURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      const userData = await userResponse.json();
      localStorage.setItem('user', JSON.stringify(userData));

      // Si marcó "recordarme", guardar en localStorage por más tiempo
      if (remember) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 días
        localStorage.setItem('token_expiry', expiryDate.getTime());
      }

      showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

      // Redirigir según el rol
      setTimeout(() => {
        if (userData.rol === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else if (userData.rol === 'empleado') {
          window.location.href = 'empleado-dashboard.html';
        } else {
          window.location.href = 'cliente-dashboard.html';
        }
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
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
