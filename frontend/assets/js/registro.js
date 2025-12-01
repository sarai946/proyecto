// Registro JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  // Verificar si ya hay sesión activa
  if (typeof isAuthenticated !== 'undefined' && isAuthenticated()) {
    const user = getCurrentUser();
    if (user.rol === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else if (user.rol === 'empleado') {
      window.location.href = 'empleado-dashboard.html';
    } else {
      window.location.href = 'cliente-dashboard.html';
    }
    return;
  }

  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Validaciones
    if (!nombre || !apellido || !email || !telefono || !password || !confirmPassword) {
      showError('Por favor completa todos los campos');
      return;
    }

    if (!terms) {
      showError('Debes aceptar los términos y condiciones');
      return;
    }

    if (password.length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Por favor ingresa un correo electrónico válido');
      return;
    }

    // Mostrar loading
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
    submitBtn.disabled = true;

    try {
      // Hacer petición al backend
      const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          email: email,
          telefono: telefono,
          password: password,
          rol: 'cliente' // Por defecto todos los registros son clientes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al crear la cuenta');
      }

      // Guardar token y usuario
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      localStorage.setItem('user', JSON.stringify(data.user));

      showSuccess('¡Cuenta creada exitosamente! Redirigiendo a tu dashboard...');

      // Redirigir al dashboard del cliente
      setTimeout(() => {
        window.location.href = 'cliente-dashboard.html';
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Error al crear la cuenta. El correo podría estar ya registrado.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
});

function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  const toggleBtn = passwordInput.nextElementSibling.querySelector('i');
  
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
  
  // Scroll to error
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
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
  
  // Scroll to success
  successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
