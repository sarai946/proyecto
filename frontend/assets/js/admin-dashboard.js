// ========================================
// CONFIGURACIÓN Y ESTADO
// ========================================

// Función para obtener API URL
function getApiUrl() {
  return window.API_CONFIG?.baseURL || 'http://localhost:8000';
}

let allReservas = [];
let allUsuarios = [];
let allServicios = [];
let allEmpleados = [];

// ========================================
// VERIFICACIÓN DE AUTENTICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar que config.js esté cargado
  if (typeof window.API_CONFIG === 'undefined') {
    console.error('config.js no está cargado correctamente');
    setTimeout(() => location.reload(), 2000);
    return;
  }

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token || userRole !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  // Cargar nombre del admin
  const nombreUsuario = localStorage.getItem('userName') || 'Administrador';
  document.getElementById('userName').textContent = nombreUsuario;

  // Configurar navegación
  setupNavigation();

  // Cargar datos iniciales
  await loadAllData();
});

// ========================================
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}

// ========================================
// NAVEGACIÓN ENTRE SECCIONES
// ========================================

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      
      // Actualizar navegación activa
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Mostrar sección
      showSection(section);
      
      // Cerrar sidebar en móvil
      if (window.innerWidth < 768) {
        sidebar.classList.remove('active');
      }
    });
  });

  // Toggle sidebar en móvil
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}

function showSection(sectionName) {
  // Ocultar todas las secciones
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.style.display = 'none');
  
  // Mostrar sección seleccionada
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
  
  // Actualizar título
  const titles = {
    'dashboard': 'Panel de Administración',
    'usuarios': 'Gestión de Usuarios',
    'reservas': 'Gestión de Reservas',
    'servicios': 'Gestión de Servicios',
    'empleados': 'Gestión de Empleados',
    'reportes': 'Reportes y Estadísticas'
  };
  document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
  
  // Cargar datos específicos de la sección
  switch(sectionName) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'usuarios':
      renderUsuariosTable();
      break;
    case 'reservas':
      renderTodasReservasTable();
      break;
    case 'servicios':
      renderServiciosTable();
      break;
    case 'empleados':
      renderEmpleadosTable();
      break;
    case 'reportes':
      loadReportesData();
      break;
  }
}

// ========================================
// CARGA DE DATOS
// ========================================

async function loadAllData() {
  const token = localStorage.getItem('token');
  
  try {
    console.log('Cargando datos desde:', getApiUrl());
    
    // Cargar todos los datos en paralelo
    const [reservasRes, usuariosRes, serviciosRes, empleadosRes] = await Promise.all([
      fetch(`${getApiUrl()}/reservas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.error('Error cargando reservas:', err);
        return { ok: false };
      }),
      fetch(`${getApiUrl()}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.error('Error cargando usuarios:', err);
        return { ok: false };
      }),
      fetch(`${getApiUrl()}/servicios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.error('Error cargando servicios:', err);
        return { ok: false };
      }),
      fetch(`${getApiUrl()}/empleados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => {
        console.error('Error cargando empleados:', err);
        return { ok: false };
      })
    ]);

    // Manejar respuestas y extraer datos
    if (reservasRes.ok) {
      const reservasData = await reservasRes.json();
      allReservas = reservasData.reservas || reservasData || [];
    }
    
    if (usuariosRes.ok) {
      const usuariosData = await usuariosRes.json();
      allUsuarios = usuariosData.usuarios || usuariosData || [];
    }
    
    if (serviciosRes.ok) {
      const serviciosData = await serviciosRes.json();
      allServicios = serviciosData.servicios || serviciosData || [];
    }
    
    if (empleadosRes.ok) {
      const empleadosData = await empleadosRes.json();
      allEmpleados = empleadosData.empleados || empleadosData || [];
    }

    console.log('Datos cargados:', {
      reservas: allReservas.length,
      usuarios: allUsuarios.length,
      servicios: allServicios.length,
      empleados: allEmpleados.length
    });

    // Cargar dashboard por defecto
    loadDashboardData();
    
  } catch (error) {
    console.error('Error cargando datos:', error);
    showToast('Error al cargar datos del sistema', 'error');
  }
}

// ========================================
// DASHBOARD PRINCIPAL
// ========================================

function loadDashboardData() {
  console.log('Cargando dashboard con datos:', {
    reservas: allReservas.length,
    usuarios: allUsuarios.length,
    servicios: allServicios.length
  });

  // Calcular estadísticas
  const reservasActivas = allReservas.filter(r => 
    r.estado === 'confirmada' || r.estado === 'pendiente'
  ).length;
  
  const reservasCompletadas = allReservas.filter(r => r.estado === 'completada');
  
  // Calcular ingresos del mes actual
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const añoActual = fechaActual.getFullYear();
  
  const reservasDelMes = reservasCompletadas.filter(r => {
    const fechaReserva = new Date(r.fecha);
    return fechaReserva.getMonth() === mesActual && fechaReserva.getFullYear() === añoActual;
  });
  
  const ingresosMes = reservasDelMes.reduce((total, r) => {
    const precio = parseFloat(r.servicio_precio) || 0;
    console.log('Reserva del mes:', {
      id: r.id,
      fecha: r.fecha,
      servicio: r.servicio_nombre,
      precio: precio
    });
    return total + precio;
  }, 0);
  
  // Calcular ingresos totales (todas las completadas)
  const ingresosTotales = reservasCompletadas.reduce((total, r) => {
    return total + (parseFloat(r.servicio_precio) || 0);
  }, 0);

  console.log('Ingresos del mes:', ingresosMes, 'de', reservasDelMes.length, 'reservas');
  console.log('Ingresos totales:', ingresosTotales, 'de', reservasCompletadas.length, 'reservas');

  // Actualizar stats cards
  updateStatCard('totalUsuarios', allUsuarios.length, `+${allUsuarios.length}`);
  updateStatCard('totalReservas', reservasActivas, 'Activas');
  updateStatCard('totalIngresos', `$${ingresosMes.toLocaleString()}`, `${reservasCompletadas.length} completadas`);
  updateStatCard('totalServicios', allServicios.length, 'Disponibles');

  // Renderizar reservas recientes (últimas 10)
  const reservasRecientes = [...allReservas]
    .sort((a, b) => {
      const fechaA = new Date(a.fecha || a.creado_en);
      const fechaB = new Date(b.fecha || b.creado_en);
      return fechaB - fechaA;
    })
    .slice(0, 10);
  
  renderReservasRecientes(reservasRecientes);
}

function updateStatCard(elementId, value, changeText) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
  
  // Actualizar texto de cambio - los IDs están en formato diferente en el HTML
  const changeMapping = {
    'totalUsuarios': 'usuariosChange',
    'totalReservas': 'reservasChange',
    'totalIngresos': 'ingresosChange',
    'totalServicios': 'serviciosChange'
  };
  
  const changeId = changeMapping[elementId];
  if (changeId) {
    const changeElement = document.getElementById(changeId);
    if (changeElement) {
      changeElement.textContent = changeText;
    }
  }
}

// ========================================
// RENDERIZADO DE TABLAS
// ========================================

function renderReservasRecientes(reservas) {
  const tbody = document.getElementById('reservasRecentesTable');
  
  if (reservas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay reservas recientes</td></tr>';
    return;
  }

  tbody.innerHTML = reservas.map(reserva => {
    const cliente = allUsuarios.find(u => u.id === reserva.id_usuario) || {};
    const servicio = allServicios.find(s => s.id === reserva.id_servicio) || {};
    const empleado = allEmpleados.find(e => e.id === reserva.id_empleado) || {};

    return `
      <tr>
        <td>${reserva.id}</td>
        <td>${cliente.nombre || 'N/A'}</td>
        <td>${servicio.nombre || 'N/A'}</td>
        <td>${empleado.nombre || 'Sin asignar'}</td>
        <td>${formatDate(reserva.fecha)}</td>
        <td>${reserva.hora}</td>
        <td><span class="status-badge ${reserva.estado}">${reserva.estado}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="cambiarEstadoReserva(${reserva.id})">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderUsuariosTable() {
  const tbody = document.getElementById('usuariosTable');
  
  if (allUsuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = allUsuarios.map(usuario => `
    <tr>
      <td>${usuario.id}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.email}</td>
      <td>${usuario.telefono || 'N/A'}</td>
      <td><span class="role-badge ${usuario.rol}">${usuario.rol}</span></td>
      <td>${formatDate(usuario.creado_en)}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="verUsuario(${usuario.id})" title="Ver detalles">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderTodasReservasTable(filtro = 'todas') {
  const tbody = document.getElementById('todasReservasTable');
  
  let reservasFiltradas = allReservas;
  if (filtro !== 'todas') {
    reservasFiltradas = allReservas.filter(r => r.estado === filtro);
  }

  if (reservasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay reservas</td></tr>';
    return;
  }

  tbody.innerHTML = reservasFiltradas.map(reserva => {
    const cliente = allUsuarios.find(u => u.id === reserva.id_usuario) || {};
    const servicio = allServicios.find(s => s.id === reserva.id_servicio) || {};
    const empleado = allEmpleados.find(e => e.id === reserva.id_empleado) || {};

    return `
      <tr>
        <td>${reserva.id}</td>
        <td>${cliente.nombre || 'N/A'}</td>
        <td>${servicio.nombre || 'N/A'}</td>
        <td>${empleado.nombre || 'Sin asignar'}</td>
        <td>${formatDate(reserva.fecha)}</td>
        <td>${reserva.hora}</td>
        <td><span class="status-badge ${reserva.estado}">${reserva.estado}</span></td>
        <td>${reserva.notas || '-'}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="cambiarEstadoReserva(${reserva.id})">
            <i class="fas fa-edit"></i> Cambiar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderServiciosTable() {
  const tbody = document.getElementById('serviciosTable');
  
  if (allServicios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay servicios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = allServicios.map(servicio => `
    <tr>
      <td>${servicio.id}</td>
      <td>${servicio.nombre}</td>
      <td>${servicio.descripcion || 'N/A'}</td>
      <td>${servicio.duracion_min} min</td>
      <td>$${servicio.precio.toLocaleString()}</td>
    </tr>
  `).join('');
}

function renderEmpleadosTable() {
  const tbody = document.getElementById('empleadosTable');
  
  if (allEmpleados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay empleados registrados</td></tr>';
    return;
  }

  tbody.innerHTML = allEmpleados.map(empleado => `
    <tr>
      <td>${empleado.id}</td>
      <td>${empleado.nombre}</td>
      <td>${empleado.email || 'N/A'}</td>
      <td>${empleado.telefono || 'N/A'}</td>
      <td>${empleado.especialidad || 'General'}</td>
    </tr>
  `).join('');
}

// ========================================
// REPORTES
// ========================================

function loadReportesData() {
  const reservasCompletadas = allReservas.filter(r => r.estado === 'completada');
  const ingresosTotales = reservasCompletadas.reduce((total, r) => {
    const servicio = allServicios.find(s => s.id === r.id_servicio);
    return total + (servicio ? servicio.precio : 0);
  }, 0);

  document.getElementById('reporteReservas').textContent = reservasCompletadas.length;
  document.getElementById('reporteIngresos').textContent = `$${ingresosTotales.toLocaleString()}`;
}

// ========================================
// ACCIONES
// ========================================

async function cambiarEstadoReserva(reservaId) {
  const reserva = allReservas.find(r => r.id === reservaId);
  if (!reserva) return;

  const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];
  const estadoActual = reserva.estado;
  
  const nuevoEstado = await showPrompt(
    `Estado actual: ${estadoActual}\n\nNuevo estado:\n1. pendiente\n2. confirmada\n3. completada\n4. cancelada\n\nIngrese el número:`,
    'Cambiar Estado de Reserva',
    ''
  );

  if (!nuevoEstado || nuevoEstado < 1 || nuevoEstado > 4) return;

  const estado = estados[parseInt(nuevoEstado) - 1];

  try {
    const token = localStorage.getItem('token');
    // El backend espera query params
    const response = await fetch(`${getApiUrl()}/reservas/${reservaId}?estado=${encodeURIComponent(estado)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Error al actualizar reserva');

    showToast(`Reserva actualizada a: ${estado}`, 'success');
    await loadAllData();
    
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cambiar estado de reserva', 'error');
  }
}

function verUsuario(userId) {
  const usuario = allUsuarios.find(u => u.id === userId);
  if (!usuario) return;

  const reservasUsuario = allReservas.filter(r => r.id_usuario === userId);
  
  alert(`
INFORMACIÓN DEL USUARIO

ID: ${usuario.id}
Nombre: ${usuario.nombre}
Email: ${usuario.email}
Teléfono: ${usuario.telefono || 'No registrado'}
Rol: ${usuario.rol}
Fecha de registro: ${formatDate(usuario.creado_en)}

Reservas totales: ${reservasUsuario.length}
Reservas completadas: ${reservasUsuario.filter(r => r.estado === 'completada').length}
Reservas canceladas: ${reservasUsuario.filter(r => r.estado === 'cancelada').length}
  `);
}

function filtrarReservas() {
  const filtro = document.getElementById('filtroEstado').value;
  renderTodasReservasTable(filtro);
}

// ========================================
// BÚSQUEDA
// ========================================

document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  // Buscar en usuarios
  const usuariosFiltrados = allUsuarios.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm) ||
    u.email.toLowerCase().includes(searchTerm)
  );

  // Buscar en servicios
  const serviciosFiltrados = allServicios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm) ||
    (s.descripcion && s.descripcion.toLowerCase().includes(searchTerm))
  );

  // Actualizar badge de notificaciones con resultados
  const totalResultados = usuariosFiltrados.length + serviciosFiltrados.length;
  document.getElementById('notificationCount').textContent = totalResultados;
});

// ========================================
// UTILIDADES
// ========================================

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showToast(message, type = 'info') {
  // Crear toast simple
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================================
// ESTILOS ADICIONALES
// ========================================

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  .text-center { text-align: center; }
  
  .role-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .role-badge.admin { background: #667eea; color: white; }
  .role-badge.empleado { background: #10b981; color: white; }
  .role-badge.cliente { background: #6b7280; color: white; }
`;
document.head.appendChild(style);
