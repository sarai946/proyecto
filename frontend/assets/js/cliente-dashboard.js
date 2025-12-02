// Cliente Dashboard JavaScript - Completo y Funcional

// Variables globales
let currentSection = 'inicio';
let todasReservas = [];
let todosServicios = [];
let todosEmpleados = [];
let currentFilter = 'todas';
let userAvatarSeed = 'default';
let currentCarouselIndex = 0;
let currentMiniCarouselIndex = 0;

// Imágenes de la galería con descripciones
const galeriaImagenes = [
  { src: 'assets/img/34.jpeg', title: 'Diseño Elegante', desc: 'Estilo clásico con detalles' },
  { src: 'assets/img/img_4.jpg', title: 'Uñas Artísticas', desc: 'Diseños únicos y personalizados' },
  { src: 'assets/img/img_5.jpg', title: 'Manicure Francesa', desc: 'El clásico que nunca pasa de moda' },
  { src: 'assets/img/11.jpg', title: 'Estilo Moderno', desc: 'Tendencias actuales' },
  { src: 'assets/img/13.jpg', title: 'Colores Vibrantes', desc: 'Diseños llamativos' },
  { src: 'assets/img/15.jpg', title: 'Minimalista Chic', desc: 'Elegancia simple' },
  { src: 'assets/img/16.jpg', title: 'Glamour Total', desc: 'Brillo y sofisticación' },
  { src: 'assets/img/unas1.jpg', title: 'Arte en Uñas', desc: 'Diseños de autor' },
  { src: 'assets/img/unas2.jpg', title: 'Creatividad', desc: 'Expresión personal' },
];

// Horarios disponibles
const horariosDisponibles = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  
  if (user.rol !== 'cliente') {
    if (user.rol === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else if (user.rol === 'empleado') {
      window.location.href = 'empleado-dashboard.html';
    }
    return;
  }

  // Generar avatar único basado en el email
  userAvatarSeed = user.email || 'default';
  updateAvatarImages(userAvatarSeed);

  // Actualizar nombre del usuario
  document.getElementById('userName').textContent = user.nombre;
  document.getElementById('clientName').textContent = user.nombre;

  // Event listeners
  document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
  setupNavigation();
  setupAgendarForm();

  // Configurar fecha mínima para agendar
  const fechaInput = document.getElementById('fechaCita');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    fechaInput.value = hoy;
  }

  // Cargar datos
  await loadInitialData();
});

// Actualizar avatares
function updateAvatarImages(seed) {
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  document.getElementById('userAvatar').src = avatarUrl;
  document.getElementById('perfilAvatar').src = avatarUrl;
}

// Cargar datos iniciales
async function loadInitialData() {
  try {
    await Promise.all([
      loadServicios(),
      loadEmpleados(),
      loadReservas(),
      loadGaleria()
    ]);
    
    updateStats();
    loadPerfil();
  } catch (error) {
    console.error('Error cargando datos:', error);
    showNotification('Error al cargar los datos', 'error');
  }
}

// Cargar servicios
async function loadServicios() {
  try {
    const response = await apiRequest('/servicios');
    todosServicios = response.servicios || [];
    
    // Llenar select de servicios
    const select = document.getElementById('servicioSelect');
    if (select) {
      select.innerHTML = '<option value="">Selecciona un servicio</option>' +
        todosServicios.map(s => `<option value="${s.id}" data-precio="${s.precio}">${s.nombre} - $${s.precio}</option>`).join('');
    }
    
    // Mostrar servicios completos
    renderServiciosCatalog();
  } catch (error) {
    console.error('Error cargando servicios:', error);
  }
}

// Cargar empleados
async function loadEmpleados() {
  try {
    const response = await apiRequest('/empleados');
    todosEmpleados = response.empleados || [];
    
    // Llenar select de empleados
    const select = document.getElementById('empleadoSelect');
    if (select) {
      select.innerHTML = '<option value="">Selecciona una especialista</option>' +
        todosEmpleados.map(e => `<option value="${e.id}">${e.nombre} - ${e.especialidad || 'Manicurista'}</option>`).join('');
    }
  } catch (error) {
    console.error('Error cargando empleados:', error);
  }
}

// Cargar reservas
async function loadReservas() {
  try {
    const response = await apiRequest('/reservas');
    const user = getCurrentUser();
    
    // Filtrar solo las reservas del usuario actual
    todasReservas = (response.reservas || []).filter(r => r.usuario_id === user.id);
    
    renderReservas();
    renderProximasCitas();
  } catch (error) {
    console.error('Error cargando reservas:', error);
    todasReservas = [];
  }
}

// Cargar galería
function loadGaleria() {
  // Mini-carrusel en inicio (muestra 3 a la vez)
  initMiniCarousel();
  
  // Carrusel completo en sección galería
  initCarousel();
}

// Inicializar mini-carrusel para inicio
function initMiniCarousel() {
  const track = document.getElementById('miniCarouselTrack');
  const indicators = document.getElementById('miniCarouselIndicators');
  
  if (!track || !indicators) return;
  
  // Crear slides (mostramos todas las imágenes)
  track.innerHTML = galeriaImagenes.map((img, index) => `
    <div class="mini-carousel-slide">
      <div class="mini-carousel-slide-inner" onclick="openImageModal(${index})">
        <img src="${img.src}" alt="${img.title}">
        <div class="mini-carousel-slide-overlay">
          <h5>${img.title}</h5>
        </div>
      </div>
    </div>
  `).join('');
  
  // Calcular páginas según el tamaño de pantalla
  updateMiniCarouselPages();
  
  // Auto-play del mini-carrusel
  startMiniAutoPlay();
}

// Actualizar páginas del mini-carrusel según responsive
function updateMiniCarouselPages() {
  const indicators = document.getElementById('miniCarouselIndicators');
  if (!indicators) return;
  
  // Detectar cuántas imágenes se muestran a la vez
  const imagesPerPage = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
  const totalPages = Math.ceil(galeriaImagenes.length / imagesPerPage);
  
  indicators.innerHTML = Array.from({ length: totalPages }, (_, index) => `
    <button class="mini-indicator ${index === 0 ? 'active' : ''}" onclick="goToMiniSlide(${index})"></button>
  `).join('');
  
  // Resetear al inicio
  currentMiniCarouselIndex = 0;
  const track = document.getElementById('miniCarouselTrack');
  if (track) track.style.transform = 'translateX(0)';
}

// Mover mini-carrusel
function moveMiniCarousel(direction) {
  const imagesPerPage = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
  const totalPages = Math.ceil(galeriaImagenes.length / imagesPerPage);
  const newIndex = currentMiniCarouselIndex + direction;
  
  if (newIndex < 0) {
    goToMiniSlide(totalPages - 1);
  } else if (newIndex >= totalPages) {
    goToMiniSlide(0);
  } else {
    goToMiniSlide(newIndex);
  }
}

// Ir a página específica del mini-carrusel
function goToMiniSlide(pageIndex) {
  currentMiniCarouselIndex = pageIndex;
  const track = document.getElementById('miniCarouselTrack');
  const indicators = document.querySelectorAll('.mini-indicator');
  
  if (track) {
    // Calcular el porcentaje de movimiento según cuántas imágenes se muestran
    const imagesPerPage = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
    const slideWidth = 100 / imagesPerPage;
    const movePercentage = pageIndex * slideWidth * imagesPerPage;
    track.style.transform = `translateX(-${movePercentage}%)`;
  }
  
  // Actualizar indicadores
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === pageIndex);
  });
}

// Auto-play del mini-carrusel
let miniAutoPlayInterval;

function startMiniAutoPlay() {
  stopMiniAutoPlay();
  miniAutoPlayInterval = setInterval(() => {
    moveMiniCarousel(1);
  }, 4000); // Cambiar cada 4 segundos
}

function stopMiniAutoPlay() {
  if (miniAutoPlayInterval) {
    clearInterval(miniAutoPlayInterval);
  }
}

// Inicializar carrusel
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const indicators = document.getElementById('carouselIndicators');
  const thumbnails = document.getElementById('carouselThumbnails');
  
  if (!track || !indicators || !thumbnails) return;
  
  // Crear slides
  track.innerHTML = galeriaImagenes.map((img, index) => `
    <div class="carousel-slide" onclick="openImageModal(${index})">
      <img src="${img.src}" alt="${img.title}">
      <div class="carousel-slide-overlay">
        <h4>${img.title}</h4>
        <p>${img.desc}</p>
      </div>
    </div>
  `).join('');
  
  // Crear indicadores
  indicators.innerHTML = galeriaImagenes.map((_, index) => `
    <button class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></button>
  `).join('');
  
  // Crear thumbnails
  thumbnails.innerHTML = galeriaImagenes.map((img, index) => `
    <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})">
      <img src="${img.src}" alt="${img.title}">
    </div>
  `).join('');
  
  // Auto-play (opcional)
  startAutoPlay();
}

// Mover carrusel
function moveCarousel(direction) {
  const newIndex = currentCarouselIndex + direction;
  
  if (newIndex < 0) {
    goToSlide(galeriaImagenes.length - 1);
  } else if (newIndex >= galeriaImagenes.length) {
    goToSlide(0);
  } else {
    goToSlide(newIndex);
  }
}

// Ir a slide específico
function goToSlide(index) {
  currentCarouselIndex = index;
  const track = document.getElementById('carouselTrack');
  const indicators = document.querySelectorAll('.indicator');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  
  // Actualizar indicadores
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });
  
  // Actualizar thumbnails
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Auto-play del carrusel
let autoPlayInterval;

function startAutoPlay() {
  stopAutoPlay(); // Limpiar cualquier intervalo anterior
  autoPlayInterval = setInterval(() => {
    moveCarousel(1);
  }, 5000); // Cambiar cada 5 segundos
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
}

// Pausar auto-play al hacer hover
document.addEventListener('DOMContentLoaded', function() {
  // Mini-carrusel
  const miniCarouselContainer = document.querySelector('.mini-carousel-container');
  if (miniCarouselContainer) {
    miniCarouselContainer.addEventListener('mouseenter', stopMiniAutoPlay);
    miniCarouselContainer.addEventListener('mouseleave', startMiniAutoPlay);
  }
  
  // Carrusel principal
  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);
  }
  
  // Navegación con teclado
  document.addEventListener('keydown', function(e) {
    // Solo si estamos en la sección de galería
    if (currentSection === 'galeria') {
      if (e.key === 'ArrowLeft') {
        moveCarousel(-1);
      } else if (e.key === 'ArrowRight') {
        moveCarousel(1);
      }
    }
  });
});

// Actualizar estadísticas
function updateStats() {
  const activas = todasReservas.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada').length;
  const completadas = todasReservas.filter(r => r.estado === 'completada').length;
  
  document.getElementById('statsReservasActivas').textContent = activas;
  document.getElementById('statsReservasCompletadas').textContent = completadas;
  document.getElementById('notificationCount').textContent = activas;
}

// Render próximas citas
function renderProximasCitas() {
  const container = document.getElementById('proximasCitasContainer');
  const proximasCitas = todasReservas
    .filter(r => r.estado === 'pendiente' || r.estado === 'confirmada')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 3);
  
  if (proximasCitas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>No tienes citas programadas</p>
        <button class="btn btn-primary" onclick="showSection('agendar')">
          <i class="fas fa-plus"></i> Agendar Cita
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = proximasCitas.map(cita => {
    const fecha = new Date(cita.fecha);
    return `
      <div class="cita-card">
        <div class="cita-date">
          <span class="day">${fecha.getDate()}</span>
          <span class="month">${fecha.toLocaleDateString('es-ES', { month: 'short' })}</span>
        </div>
        <div class="cita-info">
          <h4>${cita.servicio_nombre || 'Servicio'}</h4>
          <p><i class="fas fa-clock"></i> ${cita.hora}</p>
          <p><i class="fas fa-user"></i> ${cita.empleado_nombre || 'Por asignar'}</p>
          <span class="badge badge-${cita.estado}">${cita.estado}</span>
        </div>
        <div class="cita-actions">
          <button class="btn btn-sm btn-danger" onclick="cancelarReserva(${cita.id})">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render todas las reservas
function renderReservas() {
  const container = document.getElementById('reservasContainer');
  let reservasFiltradas = todasReservas;
  
  if (currentFilter !== 'todas') {
    reservasFiltradas = todasReservas.filter(r => r.estado === currentFilter);
  }
  
  if (reservasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>No hay reservas ${currentFilter !== 'todas' ? currentFilter + 's' : ''}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reservasFiltradas.map(cita => {
    const fecha = new Date(cita.fecha);
    return `
      <div class="reserva-card">
        <div class="reserva-header">
          <div>
            <h4>${cita.servicio_nombre || 'Servicio'}</h4>
            <p class="text-muted">${cita.empleado_nombre || 'Por asignar'}</p>
          </div>
          <span class="badge badge-${cita.estado}">${cita.estado}</span>
        </div>
        <div class="reserva-body">
          <div class="reserva-info">
            <i class="fas fa-calendar"></i>
            <span>${fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="reserva-info">
            <i class="fas fa-clock"></i>
            <span>${cita.hora}</span>
          </div>
          ${cita.notas ? `<div class="reserva-info"><i class="fas fa-comment"></i><span>${cita.notas}</span></div>` : ''}
        </div>
        ${cita.estado === 'pendiente' || cita.estado === 'confirmada' ? `
          <div class="reserva-footer">
            <button class="btn btn-sm btn-danger" onclick="cancelarReserva(${cita.id})">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Render servicios catalog
function renderServiciosCatalog() {
  const container = document.getElementById('todosServiciosContainer');
  if (!container) return;
  
  container.innerHTML = todosServicios.map(servicio => `
    <div class="servicio-card">
      <div class="servicio-icon">
        <i class="fas fa-hand-sparkles"></i>
      </div>
      <div class="servicio-content">
        <h4>${servicio.nombre}</h4>
        <p>${servicio.descripcion || 'Servicio profesional de manicure'}</p>
        <div class="servicio-footer">
          <span class="servicio-precio">$${servicio.precio}</span>
          <span class="servicio-duracion"><i class="fas fa-clock"></i> ${servicio.duracion_min || 60} min</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="agendarConServicio(${servicio.id})">
          <i class="fas fa-calendar-plus"></i> Agendar
        </button>
      </div>
    </div>
  `).join('');
}

// Filtrar reservas
function filterReservas(filtro) {
  currentFilter = filtro;
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');
  renderReservas();
}

// Navegación
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      showSection(section);
    });
  });
}

function showSection(sectionName) {
  // Actualizar navegación activa
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.nav-item[data-section="${sectionName}"]`)?.classList.add('active');
  
  // Mostrar sección
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`${sectionName}-section`)?.classList.add('active');
  
  // Actualizar título
  const titulos = {
    'inicio': 'Inicio',
    'mis-reservas': 'Mis Reservas',
    'agendar': 'Agendar Cita',
    'servicios': 'Servicios',
    'galeria': 'Galería',
    'perfil': 'Mi Perfil'
  };
  document.getElementById('pageTitle').textContent = titulos[sectionName] || 'Dashboard';
  
  currentSection = sectionName;
}

// Form agendar
function setupAgendarForm() {
  const form = document.getElementById('agendarForm');
  if (!form) {
    console.error('❌ Formulario agendarForm no encontrado');
    return;
  }
  
  console.log('✅ Configurando formulario de agendar');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📋 Formulario enviado');
    await crearReserva();
  });
  
  // Llenar horarios
  const horaSelect = document.getElementById('horaCita');
  if (horaSelect) {
    horaSelect.innerHTML = '<option value="">Selecciona una hora</option>' +
      horariosDisponibles.map(h => `<option value="${h}">${h}</option>`).join('');
    console.log('✅ Horarios cargados:', horariosDisponibles.length);
  } else {
    console.error('❌ Select de hora no encontrado');
  }
}

// Crear reserva
async function crearReserva() {
  const servicio_id = document.getElementById('servicioSelect').value;
  const empleado_id = document.getElementById('empleadoSelect').value;
  const fecha = document.getElementById('fechaCita').value;
  const hora = document.getElementById('horaCita').value;
  const notas = document.getElementById('notasCita').value;
  
  console.log('📝 Datos del formulario:', { servicio_id, empleado_id, fecha, hora, notas });
  
  if (!servicio_id || !empleado_id || !fecha || !hora) {
    showNotification('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  const user = getCurrentUser();
  
  if (!user || !user.id) {
    showNotification('Error: Usuario no identificado', 'error');
    return;
  }
  
  const reservaData = {
    usuario_id: user.id,
    servicio_id: parseInt(servicio_id),
    empleado_id: parseInt(empleado_id),
    fecha,
    hora,
    estado: 'pendiente',
    notas: notas || null
  };
  
  console.log('📤 Enviando reserva:', reservaData);
  
  try {
    const response = await apiRequest('/reservas', {
      method: 'POST',
      body: JSON.stringify(reservaData)
    });
    
    console.log('✅ Respuesta del servidor:', response);
    showNotification('¡Cita agendada exitosamente!', 'success');
    document.getElementById('agendarForm').reset();
    
    // Recargar datos
    await loadReservas();
    updateStats();
    
    // Mostrar sección de reservas
    showSection('mis-reservas');
  } catch (error) {
    console.error('❌ Error creando reserva:', error);
    showNotification(error.message || 'Error al agendar la cita', 'error');
  }
}

// Agendar con servicio predefinido
function agendarConServicio(servicioId) {
  showSection('agendar');
  document.getElementById('servicioSelect').value = servicioId;
}

// Cancelar reserva
async function cancelarReserva(reservaId) {
  if (!confirm('¿Estás segura de que deseas cancelar esta cita?')) {
    return;
  }
  
  try {
    await apiRequest(`/reservas/${reservaId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: 'cancelada' })
    });
    
    showNotification('Cita cancelada correctamente', 'success');
    await loadReservas();
    updateStats();
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    showNotification('Error al cancelar la cita', 'error');
  }
}

// Cargar perfil
function loadPerfil() {
  const user = getCurrentUser();
  
  document.getElementById('perfilNombre').textContent = `${user.nombre} ${user.apellido || ''}`;
  document.getElementById('perfilEmail').textContent = user.email;
  document.getElementById('perfilNombreCompleto').textContent = `${user.nombre} ${user.apellido || ''}`;
  document.getElementById('perfilEmailInfo').textContent = user.email;
  document.getElementById('perfilTelefonoInfo').textContent = user.telefono || 'No registrado';
  
  const fechaRegistro = new Date(user.fecha_registro || Date.now());
  document.getElementById('perfilFechaRegistro').textContent = fechaRegistro.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Estadísticas del perfil
  const total = todasReservas.length;
  const completadas = todasReservas.filter(r => r.estado === 'completada').length;
  const proxima = todasReservas
    .filter(r => r.estado === 'pendiente' || r.estado === 'confirmada')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
  
  document.getElementById('perfilTotalCitas').textContent = total;
  document.getElementById('perfilCitasCompletadas').textContent = completadas;
  
  if (proxima) {
    const fecha = new Date(proxima.fecha);
    document.getElementById('perfilProximaCita').textContent = 
      `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  } else {
    document.getElementById('perfilProximaCita').textContent = 'Sin citas';
  }
}

// Cambiar avatar
function cambiarAvatar() {
  const modal = document.getElementById('avatarModal');
  const grid = document.getElementById('avatarGrid');
  
  // Generar 12 avatares aleatorios
  const avatares = [];
  for (let i = 0; i < 12; i++) {
    const seed = Math.random().toString(36).substring(7);
    avatares.push(seed);
  }
  
  grid.innerHTML = avatares.map(seed => `
    <div class="avatar-option" onclick="selectAvatar('${seed}')">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}" alt="Avatar">
    </div>
  `).join('');
  
  modal.style.display = 'block';
}

function selectAvatar(seed) {
  userAvatarSeed = seed;
  updateAvatarImages(seed);
  closeAvatarModal();
  showNotification('Avatar actualizado', 'success');
}

function closeAvatarModal() {
  document.getElementById('avatarModal').style.display = 'none';
}

// Toggle sidebar
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Notificaciones
function showNotification(message, type = 'info') {
  // Crear notificación toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
  const avatarModal = document.getElementById('avatarModal');
  if (event.target === avatarModal) {
    closeAvatarModal();
  }
}

// ========================================
// MODAL DE IMAGEN COMPLETA
// ========================================

let currentImageIndex = 0;

function openImageModal(index) {
  currentImageIndex = index;
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('modalImage');
  const title = document.getElementById('modalImageTitle');
  const desc = document.getElementById('modalImageDesc');
  
  const imageData = galeriaImagenes[index];
  
  img.src = imageData.src;
  title.textContent = imageData.title;
  desc.textContent = imageData.desc;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Pausar auto-play del carrusel
  stopAutoPlay();
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  
  // Reanudar auto-play si estamos en galería
  if (currentSection === 'galeria') {
    startAutoPlay();
  }
}

function nextImageModal() {
  currentImageIndex = (currentImageIndex + 1) % galeriaImagenes.length;
  updateImageModal();
}

function prevImageModal() {
  currentImageIndex = (currentImageIndex - 1 + galeriaImagenes.length) % galeriaImagenes.length;
  updateImageModal();
}

function updateImageModal() {
  const img = document.getElementById('modalImage');
  const title = document.getElementById('modalImageTitle');
  const desc = document.getElementById('modalImageDesc');
  
  const imageData = galeriaImagenes[currentImageIndex];
  
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = imageData.src;
    title.textContent = imageData.title;
    desc.textContent = imageData.desc;
    img.style.opacity = '1';
  }, 150);
}

// Navegación con teclado en modal de imagen
document.addEventListener('keydown', function(e) {
  const imageModal = document.getElementById('imageModal');
  if (imageModal && imageModal.classList.contains('show')) {
    if (e.key === 'ArrowLeft') {
      prevImageModal();
    } else if (e.key === 'ArrowRight') {
      nextImageModal();
    } else if (e.key === 'Escape') {
      closeImageModal();
    }
  }
});

// Listener para resize del mini-carrusel responsive
window.addEventListener('resize', () => {
  if (document.querySelector('.mini-carousel-container')) {
    updateMiniCarouselPages();
  }
});
