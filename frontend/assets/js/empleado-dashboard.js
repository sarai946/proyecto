// Empleado Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
  // Verificar autenticación
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  
  if (user.rol !== 'empleado') {
    // Redirigir según el rol
    if (user.rol === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'cliente-dashboard.html';
    }
    return;
  }

  // Actualizar nombre del usuario
  document.getElementById('userName').textContent = user.nombre;

  // Actualizar reloj
  updateClock();
  setInterval(updateClock, 1000);

  // Actualizar fecha
  updateTodayDate();

  // Cargar datos
  await loadEmpleadoData();

  // Event listeners
  document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
  setupNavigation();
});

async function loadEmpleadoData() {
  try {
    const user = getCurrentUser();
    
    // Cargar citas del empleado
    const citas = await apiRequest(`/reservas?empleado_id=${user.id}`);
    
    // Filtrar por fecha
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = citas.filter(c => c.fecha.startsWith(hoy));
    
    // Calcular estadísticas
    document.getElementById('citasHoy').textContent = citasHoy.length;
    
    const estaSemana = citas.filter(c => {
      const citaDate = new Date(c.fecha);
      const hoyDate = new Date();
      const diff = Math.abs(citaDate - hoyDate);
      return diff <= 7 * 24 * 60 * 60 * 1000;
    });
    document.getElementById('citasSemana').textContent = estaSemana.length;
    
    const completadas = citas.filter(c => c.estado === 'completada');
    document.getElementById('citasCompletadas').textContent = completadas.length;
    
    // Renderizar timeline del día
    renderCitasTimeline(citasHoy);
    
    // Renderizar próximas citas
    renderProximasCitas(citas);
    
    // Renderizar historial
    renderHistorialTable(citas);

  } catch (error) {
    console.error('Error cargando datos:', error);
    showErrorMessage('Error al cargar tus datos');
  }
}

function renderCitasTimeline(citas) {
  const container = document.getElementById('citasTimeline');
  
  if (citas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-check"></i>
        <p>No tienes citas programadas para hoy</p>
      </div>
    `;
    return;
  }

  container.innerHTML = citas.sort((a, b) => a.hora.localeCompare(b.hora)).map(cita => `
    <div class="timeline-item">
      <div class="timeline-time">${cita.hora}</div>
      <div class="timeline-content">
        <h4>${cita.servicio}</h4>
        <p><i class="fas fa-user"></i> ${cita.nombre_cliente}</p>
        <span class="status-badge ${cita.estado}">${cita.estado}</span>
      </div>
      <div class="timeline-actions">
        <button class="btn btn-sm btn-primary" onclick="completarCita(${cita.id})">
          <i class="fas fa-check"></i> Completar
        </button>
      </div>
    </div>
  `).join('');
}

function renderProximasCitas(citas) {
  const container = document.getElementById('proximasCitas');
  const proximasCitas = citas.filter(c => new Date(c.fecha) > new Date()).slice(0, 5);
  
  if (proximasCitas.length === 0) {
    container.innerHTML = '<p class="text-center">No hay citas próximas</p>';
    return;
  }

  container.innerHTML = proximasCitas.map(cita => `
    <div class="appointment-item">
      <div class="appointment-date">
        ${formatDate(cita.fecha)} - ${cita.hora}
      </div>
      <div class="appointment-info">
        <strong>${cita.nombre_cliente}</strong>
        <p>${cita.servicio}</p>
      </div>
    </div>
  `).join('');
}

function renderHistorialTable(citas) {
  const tbody = document.getElementById('historialTable');
  
  if (citas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay historial disponible</td></tr>';
    return;
  }

  tbody.innerHTML = citas.slice(0, 10).map(cita => `
    <tr>
      <td>${formatDate(cita.fecha)} ${cita.hora}</td>
      <td>${cita.nombre_cliente}</td>
      <td>${cita.servicio}</td>
      <td>${cita.duracion || '60 min'}</td>
      <td><span class="status-badge ${cita.estado}">${cita.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="verDetalle(${cita.id})">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  const timeElement = document.querySelector('#currentTime span');
  if (timeElement) {
    timeElement.textContent = timeString;
  }
}

function updateTodayDate() {
  const today = new Date();
  const dateString = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateElement = document.querySelector('#todayDate span');
  if (dateElement) {
    dateElement.textContent = dateString;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('active');
}

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function completarCita(id) {
  if (confirm('¿Marcar esta cita como completada?')) {
    console.log('Completar cita:', id);
    alert('Función en desarrollo');
  }
}

function verDetalle(id) {
  console.log('Ver detalle:', id);
  alert('Función en desarrollo');
}

function showErrorMessage(message) {
  console.error(message);
}
