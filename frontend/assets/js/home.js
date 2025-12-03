// Home Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll para los enlaces del navbar
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Cambiar navbar al hacer scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.remove('transparent');
      header.classList.add('scrolled');
    } else {
      header.classList.add('transparent');
      header.classList.remove('scrolled');
    }
  });

  // Animación de aparición de elementos al hacer scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar elementos para animación
  document.querySelectorAll('.service-card, .gallery-item, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });

  // Verificar si hay sesión activa
  checkSession();
});

// Verificar sesión del usuario
function checkSession() {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const loginBtn = document.querySelector('.btn-login');
  
  if (token && user.nombre) {
    // Usuario logueado - cambiar botón
    loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.nombre}`;
    loginBtn.href = user.rol === 'admin' ? 'admin-dashboard.html' : 'cliente-dashboard.html';
    
    // Agregar menú dropdown (opcional)
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
      <a href="${user.rol === 'admin' ? 'admin-dashboard.html' : 'cliente-dashboard.html'}">
        <i class="fas fa-tachometer-alt"></i> Dashboard
      </a>
      <a href="#" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
      </a>
    `;
    loginBtn.parentElement.style.position = 'relative';
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
  }
}

// Función de logout
async function logout() {
  const confirmed = await showConfirm('¿Estás segura de que quieres cerrar sesión?', 'Cerrar Sesión');
  if (confirmed) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
    
    // Prevenir volver atrás
    window.location.replace('home.html');
    window.history.pushState(null, '', 'home.html');
  }
}

// Prevenir navegación hacia atrás después de logout
window.addEventListener('popstate', function() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.history.pushState(null, '', 'home.html');
  }
});
