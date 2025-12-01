// Cliente Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
  // Verificar autenticación
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  
  if (user.rol !== 'cliente') {
    // Redirigir según el rol
    if (user.rol === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else if (user.rol === 'empleado') {
      window.location.href = 'empleado-dashboard.html';
    }
    return;
  }

  // Actualizar nombre del usuario
  document.getElementById('userName').textContent = user.nombre;
  document.getElementById('clientName').textContent = user.nombre;

  // Cargar datos
  await loadClientData();

  // Event listeners
  document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
  setupNavigation();
});

async function loadClientData() {
  try {
    const user = getCurrentUser();
    
    // Cargar reservas del cliente
    const reservas = await apiRequest(`/reservas?usuario_id=${user.id}`);
    
    // Filtrar reservas activas y completadas
    const reservasActivas = reservas.filter(r => r.estado === 'pendiente' || r.estado === 'confirmada');
    const reservasCompletadas = reservas.filter(r => r.estado === 'completada');
    
    document.getElementById('misReservas').textContent = reservasActivas.length;
    document.getElementById('reservasCompletadas').textContent = reservasCompletadas.length;
    
    // Renderizar próximas citas
    renderProximasCitas(reservasActivas);
    
    // Renderizar historial
    renderHistorialTable(reservas);
    
    // Cargar servicios destacados
    await loadServiciosDestacados();

  } catch (error) {
    console.error('Error cargando datos:', error);
    showErrorMessage('Error al cargar tus datos');
  }
}

function renderProximasCitas(citas) {
  const container = document.getElementById('proximasCitas');
  
  if (citas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>No tienes citas programadas</p>
        <button class="btn btn-primary" onclick="showAgendarModal()">
          <i class="fas fa-plus"></i> Agendar Cita
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = citas.map(cita => `
    <div class="cita-card">
      <div class="cita-date">
        <span class="day">${new Date(cita.fecha).getDate()}</span>
        <span class="month">${new Date(cita.fecha).toLocaleDateString('es-ES', { month: 'short' })}</span>
      </div>
      <div class="cita-info">
        <h4>${cita.servicio}</h4>
        <p><i class="fas fa-clock"></i> ${cita.hora}</p>
        <p><i class="fas fa-user"></i> ${cita.empleado || 'Por asignar'}</p>
      </div>
      <div class="cita-actions">
        <button class="btn btn-sm btn-outline" onclick="cancelarCita(${cita.id})">
          Cancelar
        </button>
      </div>
    </div>
  `).join('');
}

async function loadServiciosDestacados() {
  try {
    const servicios = await apiRequest('/servicios');
    const container = document.getElementById('serviciosDestacados');
    
    container.innerHTML = servicios.slice(0, 4).map(servicio => `
      <div class="service-item">
        <i class="fas fa-hand-sparkles"></i>
        <h4>${servicio.nombre}</h4>
        <p class="price">$${servicio.precio}</p>
        <button class="btn btn-sm btn-primary" onclick="agendarServicio(${servicio.id})">
          Agendar
        </button>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error cargando servicios:', error);
  }
}

function renderHistorialTable(reservas) {
  const tbody = document.getElementById('historialTable');
  
  if (reservas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No tienes historial de citas</td></tr>';
    return;
  }

  tbody.innerHTML = reservas.slice(0, 10).map(reserva => `
    <tr>
      <td>${formatDate(reserva.fecha)} ${reserva.hora}</td>
      <td>${reserva.servicio}</td>
      <td>${reserva.empleado || 'N/A'}</td>
      <td><span class="status-badge ${reserva.estado}">${reserva.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="verDetalle(${reserva.id})">
          <i class="fas fa-eye"></i> Ver
        </button>
      </td>
    </tr>
  `).join('');
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

function showAgendarModal() {
  alert('Modal de agendar cita - En desarrollo');
}

function cancelarCita(id) {
  if (confirm('¿Estás seguro de cancelar esta cita?')) {
    console.log('Cancelar cita:', id);
    alert('Función en desarrollo');
  }
}

function agendarServicio(id) {
  console.log('Agendar servicio:', id);
  showAgendarModal();
}

function verDetalle(id) {
  console.log('Ver detalle de reserva:', id);
  alert('Función en desarrollo');
}

function showErrorMessage(message) {
  console.error(message);
}
