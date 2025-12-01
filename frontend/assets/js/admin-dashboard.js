// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
  // Verificar autenticación y rol
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  
  if (user.rol !== 'admin') {
    // Redirigir según el rol
    if (user.rol === 'empleado') {
      window.location.href = 'empleado-dashboard.html';
    } else {
      window.location.href = 'cliente-dashboard.html';
    }
    return;
  }

  // Actualizar nombre del usuario
  document.getElementById('userName').textContent = user.nombre;

  // Cargar datos del dashboard
  await loadDashboardData();

  // Event listeners
  document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
  setupNavigation();
});

async function loadDashboardData() {
  try {
    // Cargar usuarios
    const usuarios = await apiRequest('/usuarios');
    document.getElementById('totalUsuarios').textContent = usuarios.length;
    renderUsuariosTable(usuarios);

    // Cargar reservas
    const reservas = await apiRequest('/reservas');
    document.getElementById('totalReservas').textContent = reservas.length;
    renderReservasTable(reservas);

    // Cargar servicios
    const servicios = await apiRequest('/servicios');
    document.getElementById('totalServicios').textContent = servicios.length;

  } catch (error) {
    console.error('Error cargando datos:', error);
    showNotification('Error al cargar los datos del dashboard', 'error');
  }
}

function renderUsuariosTable(usuarios) {
  const tbody = document.getElementById('usuariosTable');
  
  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = usuarios.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.nombre} ${user.apellido}</td>
      <td>${user.email}</td>
      <td>${user.telefono || 'N/A'}</td>
      <td><span class="role-badge ${user.rol}">${user.rol}</span></td>
      <td>${formatDate(user.fecha_registro)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editUser(${user.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline" onclick="deleteUser(${user.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderReservasTable(reservas) {
  const tbody = document.getElementById('reservasTable');
  
  if (reservas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay reservas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = reservas.slice(0, 10).map(reserva => `
    <tr>
      <td>${reserva.id}</td>
      <td>${reserva.nombre_cliente || 'N/A'}</td>
      <td>${reserva.servicio || 'N/A'}</td>
      <td>${formatDate(reserva.fecha)}</td>
      <td>${reserva.hora || 'N/A'}</td>
      <td><span class="status-badge ${reserva.estado}">${reserva.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewReserva(${reserva.id})">
          <i class="fas fa-eye"></i>
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

function showNotification(message, type = 'info') {
  // Implementar notificación toast
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Funciones placeholder para acciones
function editUser(id) {
  console.log('Editar usuario:', id);
  showNotification('Función en desarrollo', 'info');
}

function deleteUser(id) {
  if (confirm('¿Estás seguro de eliminar este usuario?')) {
    console.log('Eliminar usuario:', id);
    showNotification('Función en desarrollo', 'info');
  }
}

function viewReserva(id) {
  console.log('Ver reserva:', id);
  showNotification('Función en desarrollo', 'info');
}

function showAddUserModal() {
  showNotification('Modal de agregar usuario - En desarrollo', 'info');
}
