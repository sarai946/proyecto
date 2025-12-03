// ========================================
// CONFIGURACIÓN Y ESTADO
// ========================================

// Estado global
let misReservas = [];
let allUsuarios = [];
let allServicios = [];
let empleadoInfo = null;

// Función para obtener API URL
function getApiUrl() {
  return window.API_CONFIG?.baseURL || 'http://localhost:8000';
}

// Hacer estas funciones globales
window.cerrarSesion = cerrarSesion;
window.cambiarEstadoCita = cambiarEstadoCita;
window.filtrarMisCitas = filtrarMisCitas;

// ========================================
// VERIFICACIÓN DE AUTENTICACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar que todas las dependencias estén cargadas
  if (typeof window.API_CONFIG === 'undefined') {
    console.error('config.js no está cargado correctamente');
    showToast('Error de configuración. Recargando...', 'error');
    setTimeout(() => location.reload(), 2000);
    return;
  }

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    window.location.replace('login.html');
    return;
  }

  if (userRole !== 'empleado') {
    if (userRole === 'admin') {
      window.location.replace('admin-dashboard.html');
    } else {
      window.location.replace('cliente-dashboard.html');
    }
    return;
  }

  // Cargar nombre del empleado
  const nombreUsuario = localStorage.getItem('userName') || 'Empleado';
  
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = nombreUsuario;
  }

  // Actualizar avatares
  const avatarSeed = nombreUsuario.toLowerCase().replace(/\s/g, '');
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
  
  const employeeAvatar = document.getElementById('employeeAvatar');
  const perfilAvatar = document.getElementById('perfilAvatar');
  
  if (employeeAvatar) employeeAvatar.src = avatarUrl;
  if (perfilAvatar) perfilAvatar.src = avatarUrl;

  // Configurar navegación
  setupNavigation();

  // Actualizar reloj
  updateClock();
  setInterval(updateClock, 1000);

  // Actualizar fecha
  updateFecha();

  // Cargar datos del empleado
  await loadEmpleadoInfo();
  
  // Cargar datos iniciales
  await loadAllData();
});

// ========================================
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {
  console.log('🚪 Cerrando sesión...');
  
  // Limpiar todos los datos de autenticación
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
  
  // Redirigir inmediatamente
  window.location.replace('login.html');
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
  menuToggle?.addEventListener('click', () => {
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
    'dashboard': 'Panel de Empleado',
    'mis-citas': 'Todas Mis Citas',
    'citas-hoy': 'Citas de Hoy',
    'clientes': 'Mis Clientes',
    'perfil': 'Mi Perfil'
  };
  
  const titleElement = document.getElementById('pageTitle');
  if (titleElement) {
    titleElement.textContent = titles[sectionName] || 'Dashboard';
  }
  
  // Cargar datos específicos de la sección
  try {
    switch(sectionName) {
      case 'dashboard':
        loadDashboardData();
        break;
      case 'mis-citas':
        renderMisCitasTable();
        break;
      case 'citas-hoy':
        renderCitasHoy();
        break;
      case 'clientes':
        renderMisClientes();
        break;
      case 'perfil':
        renderPerfil();
        break;
    }
  } catch (error) {
    console.error('Error al cargar sección:', error);
  }
}

// ========================================
// CARGA DE DATOS
// ========================================

async function loadEmpleadoInfo() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${getApiUrl()}/empleados`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      console.warn('No se pudieron cargar empleados, usando datos por defecto');
      return null;
    }
    
    const data = await response.json();
    const empleados = data.empleados || data || [];
    
    // Buscar el empleado por el userName
    const userName = localStorage.getItem('userName');
    empleadoInfo = empleados.find(e => e.nombre === userName) || empleados[0] || null;
    
    console.log('✅ Empleado info cargada:', empleadoInfo);
    return empleadoInfo;
    
  } catch (error) {
    console.error('❌ Error cargando info del empleado:', error);
    return null;
  }
}

async function loadAllData() {
  const token = localStorage.getItem('token');
  
  try {
    console.log('🔄 Cargando datos del empleado...');
    
    // Cargar todos los datos en paralelo
    const [reservasRes, usuariosRes, serviciosRes] = await Promise.all([
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
      })
    ]);

    // Procesar respuestas con validación
    let todasReservas = [];
    if (reservasRes.ok) {
      const data = await reservasRes.json();
      todasReservas = data.reservas || data || [];
    }
    
    if (usuariosRes.ok) {
      const data = await usuariosRes.json();
      allUsuarios = data.usuarios || data || [];
    }
    
    if (serviciosRes.ok) {
      const data = await serviciosRes.json();
      allServicios = data.servicios || data || [];
    }

    console.log('📊 Datos cargados:', {
      reservas: todasReservas.length,
      usuarios: allUsuarios.length,
      servicios: allServicios.length,
      empleadoInfo: empleadoInfo?.nombre || 'No disponible'
    });

    // Filtrar solo las reservas asignadas a este empleado
    if (empleadoInfo && empleadoInfo.id) {
      misReservas = todasReservas.filter(r => r.id_empleado === empleadoInfo.id);
      console.log(`✅ Reservas del empleado ${empleadoInfo.nombre}:`, misReservas.length);
    } else {
      // Fallback: mostrar todas las reservas
      misReservas = todasReservas;
      console.log('⚠️ No se encontró info del empleado, mostrando todas las reservas');
    }

    // Cargar dashboard por defecto
    loadDashboardData();
    
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    showToast('Error al cargar datos del sistema. Verifique su conexión.', 'error');
  }
}

// ========================================
// DASHBOARD PRINCIPAL
// ========================================

function loadDashboardData() {
  const hoy = new Date().toISOString().split('T')[0];
  
  // Citas de hoy
  const citasHoy = misReservas.filter(r => r.fecha && r.fecha.startsWith(hoy));
  
  // Citas de esta semana
  const inicioSemana = new Date();
  const finSemana = new Date();
  finSemana.setDate(finSemana.getDate() + 7);
  
  const citasSemana = misReservas.filter(r => {
    if (!r.fecha) return false;
    const fecha = new Date(r.fecha);
    return fecha >= inicioSemana && fecha <= finSemana;
  });
  
  // Citas completadas este mes
  const mesActual = new Date().getMonth();
  const completadasMes = misReservas.filter(r => {
    if (!r.fecha) return false;
    const fecha = new Date(r.fecha);
    return fecha.getMonth() === mesActual && r.estado === 'completada';
  });

  // Actualizar stats con validación
  const updateStat = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  updateStat('citasHoy', citasHoy.length);
  updateStat('citasSemana', citasSemana.length);
  updateStat('completadasMes', completadasMes.length);

  // Próxima cita
  const proximaCita = citasHoy.filter(c => c.estado !== 'cancelada')
    .sort((a, b) => {
      const horaA = String(a.hora || '');
      const horaB = String(b.hora || '');
      return horaA.localeCompare(horaB);
    })[0];
  
  if (proximaCita && proximaCita.hora) {
    const ahora = new Date();
    const horaCita = new Date(`${hoy}T${proximaCita.hora}`);
    const minutos = Math.floor((horaCita - ahora) / 60000);
    
    if (minutos > 0) {
      updateStat('citasHoyChange', `Próxima en ${minutos} min`);
    } else {
      updateStat('citasHoyChange', '¡Ahora!');
    }
  } else {
    updateStat('citasHoyChange', 'Sin citas');
  }

  // Notificaciones
  const pendientes = citasHoy.filter(c => c.estado === 'pendiente').length;
  updateStat('notificationCount', pendientes);

  // Renderizar agenda del día
  renderAgendaHoy(citasHoy);

  // Renderizar próximas citas
  renderProximasCitas(citasSemana);

  // Renderizar estadísticas del mes
  renderEstadisticasMes();
}

// ========================================
// ESTADÍSTICAS DEL MES
// ========================================

function renderEstadisticasMes() {
  const mesActual = new Date().getMonth();
  const anioActual = new Date().getFullYear();

  // Filtrar reservas del mes actual
  const reservasMes = misReservas.filter(r => {
    if (!r.fecha) return false;
    const fecha = new Date(r.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  });

  // Total de citas del mes
  const totalCitas = reservasMes.length;

  // Clientes únicos atendidos
  const clientesUnicos = new Set(reservasMes.map(r => r.id_usuario));
  const clientesAtendidos = clientesUnicos.size;

  // Horas trabajadas (estimado basado en duración de servicios)
  let horasTotales = 0;
  reservasMes.forEach(r => {
    const servicio = allServicios.find(s => s.id === r.id_servicio);
    if (servicio && servicio.duracion_min) {
      horasTotales += servicio.duracion_min / 60;
    }
  });

  // Ingresos generados (estimado basado en precios de servicios)
  let ingresosTotales = 0;
  reservasMes.forEach(r => {
    const servicio = allServicios.find(s => s.id === r.id_servicio);
    if (servicio && servicio.precio && r.estado === 'completada') {
      ingresosTotales += parseFloat(servicio.precio);
    }
  });

  // Actualizar elementos
  const updateStat = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  updateStat('totalCitasMes', totalCitas);
  updateStat('clientesAtendidos', clientesAtendidos);
  updateStat('horasTrabajadas', Math.round(horasTotales));
  updateStat('ingresosGenerados', `$${ingresosTotales.toFixed(2)}`);
}

function renderAgendaHoy(citasHoy) {
  const container = document.getElementById('agendaHoy');
  
  if (!container) {
    console.warn('Elemento agendaHoy no encontrado');
    return;
  }
  
  if (!citasHoy || citasHoy.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No tienes citas programadas para hoy 🎉</p>';
    return;
  }

  container.innerHTML = citasHoy
    .sort((a, b) => {
      const horaA = String(a.hora || '');
      const horaB = String(b.hora || '');
      return horaA.localeCompare(horaB);
    })
    .map(cita => {
      const cliente = allUsuarios.find(u => u.id === cita.id_usuario) || { nombre: 'Cliente' };
      const servicio = allServicios.find(s => s.id === (cita.id_servicio || cita.servicio_id)) || { nombre: 'Servicio', duracion_min: 60 };
      
      const estadoColor = {
        'pendiente': '#f59e0b',
        'confirmada': '#3b82f6',
        'completada': '#10b981',
        'cancelada': '#ef4444'
      }[cita.estado || 'pendiente'];
      
      return `
        <div style="display: flex; align-items: center; gap: 15px; padding: 20px; background: white; border-left: 4px solid ${estadoColor}; margin-bottom: 12px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); transition: all 0.3s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.08)'">
          <div style="min-width: 90px; text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
            <div style="font-size: 28px; font-weight: 800; line-height: 1;">${formatHora(cita.hora)}</div>
            <div style="font-size: 11px; margin-top: 5px; opacity: 0.9;">${servicio.duracion_min} min</div>
          </div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              <i class="fas fa-user" style="color: #667eea; margin-right: 8px;"></i>${cliente.nombre}
            </h4>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
              <i class="fas fa-hand-sparkles" style="color: #f59e0b; margin-right: 5px;"></i>
              ${servicio.nombre}
            </p>
            ${cita.notas ? `<p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 13px; font-style: italic;"><i class="fas fa-comment" style="margin-right: 5px;"></i>${cita.notas}</p>` : ''}
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span class="status-badge ${cita.estado || 'pendiente'}" style="font-size: 12px; padding: 6px 14px; text-transform: uppercase; letter-spacing: 0.5px;">${cita.estado || 'pendiente'}</span>
            <button class="btn btn-primary btn-sm" onclick="cambiarEstadoCita(${cita.id})" title="Cambiar estado" style="padding: 8px 12px;">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
}

function renderProximasCitas(citas) {
  const tbody = document.getElementById('proximasCitasTable');
  
  if (!tbody) {
    console.error('Elemento proximasCitasTable no encontrado');
    return;
  }
  
  if (citas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay citas próximas</td></tr>';
    return;
  }

  const citasOrdenadas = citas
    .filter(c => c.estado !== 'cancelada')
    .sort((a, b) => {
      const dateA = new Date(`${a.fecha || '2000-01-01'}T${a.hora || '00:00'}`);
      const dateB = new Date(`${b.fecha || '2000-01-01'}T${b.hora || '00:00'}`);
      return dateA - dateB;
    })
    .slice(0, 6);

  tbody.innerHTML = citasOrdenadas.map(cita => {
    const cliente = allUsuarios.find(u => u.id === cita.id_usuario) || { nombre: 'N/A' };
    const servicio = allServicios.find(s => s.id === (cita.id_servicio || cita.servicio_id)) || { nombre: 'N/A', duracion_min: 60 };

    return `
      <tr style="transition: background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
        <td><strong style="color: #667eea; font-size: 16px;">${formatHora(cita.hora)}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-user-circle" style="color: #9ca3af;"></i>
            <span>${cliente.nombre}</span>
          </div>
        </td>
        <td>${servicio.nombre}</td>
        <td><span class="status-badge ${cita.estado || 'pendiente'}">${cita.estado || 'pendiente'}</span></td>
      </tr>
    `;
  }).join('');
}

// ========================================
// MIS CITAS
// ========================================

function renderMisCitasTable(filtro = 'todas') {
  const tbody = document.getElementById('misCitasTable');
  
  if (!tbody) {
    console.warn('Elemento misCitasTable no encontrado');
    return;
  }
  
  let citasFiltradas = misReservas || [];
  if (filtro !== 'todas') {
    citasFiltradas = citasFiltradas.filter(r => r.estado === filtro);
  }

  if (citasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay citas</td></tr>';
    return;
  }

  tbody.innerHTML = citasFiltradas
    .sort((a, b) => {
      const dateA = new Date(`${b.fecha || '2000-01-01'}T${String(b.hora || '00:00')}`);
      const dateB = new Date(`${a.fecha || '2000-01-01'}T${String(a.hora || '00:00')}`);
      return dateA - dateB;
    })
    .map(cita => {
      const cliente = allUsuarios.find(u => u.id === cita.id_usuario) || { nombre: 'N/A' };
      const servicio = allServicios.find(s => s.id === (cita.id_servicio || cita.servicio_id)) || { nombre: 'N/A' };

      return `
        <tr>
          <td>${cita.id}</td>
          <td>${formatDate(cita.fecha)}</td>
          <td>${formatHora(cita.hora)}</td>
          <td>${cliente.nombre}</td>
          <td>${servicio.nombre}</td>
          <td><span class="status-badge ${cita.estado || 'pendiente'}">${cita.estado || 'pendiente'}</span></td>
          <td>${cita.notas || '-'}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="cambiarEstadoCita(${cita.id})">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
}

function filtrarMisCitas() {
  const filtro = document.getElementById('filtroEstadoEmpleado').value;
  renderMisCitasTable(filtro);
}

// ========================================
// CITAS DE HOY
// ========================================

function renderCitasHoy() {
  const container = document.getElementById('citasHoyList');
  const fechaHeader = document.getElementById('fechaHoyHeader');
  
  if (!container) {
    console.warn('Elemento citasHoyList no encontrado');
    return;
  }
  
  const hoy = new Date().toISOString().split('T')[0];
  const citasHoy = (misReservas || []).filter(r => r.fecha && r.fecha.startsWith(hoy));

  if (fechaHeader) {
    fechaHeader.textContent = formatDate(hoy);
  }

  if (citasHoy.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 60px; color: #6b7280; font-size: 18px;">No tienes citas para hoy 🎉</p>';
    return;
  }

  container.innerHTML = citasHoy
    .sort((a, b) => {
      const horaA = String(a.hora || '');
      const horaB = String(b.hora || '');
      return horaA.localeCompare(horaB);
    })
    .map(cita => {
      const cliente = allUsuarios.find(u => u.id === cita.id_usuario) || { nombre: 'Cliente' };
      const servicio = allServicios.find(s => s.id === (cita.id_servicio || cita.servicio_id)) || { nombre: 'Servicio', duracion_min: 60 };
      
      return `
        <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #667eea;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
              <h3 style="margin: 0; color: #1f2937; font-size: 20px;">
                <i class="fas fa-clock" style="color: #667eea;"></i> ${formatHora(cita.hora)}
              </h3>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Duración: ${servicio.duracion_min || 60} minutos</p>
            </div>
            <span class="status-badge ${cita.estado || 'pendiente'}" style="font-size: 14px; padding: 8px 16px;">${cita.estado || 'pendiente'}</span>
          </div>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${cliente.nombre || 'N/A'}</p>
            <p style="margin: 0 0 8px 0;"><strong>Servicio:</strong> ${servicio.nombre || 'N/A'}</p>
            <p style="margin: 0 0 8px 0;"><strong>Precio:</strong> $${servicio.precio || 0}</p>
            ${cliente.telefono ? `<p style="margin: 0;"><strong>Teléfono:</strong> ${cliente.telefono}</p>` : ''}
          </div>
          
          ${cita.notas ? `
            <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 0; color: #92400e;"><i class="fas fa-sticky-note"></i> <strong>Notas:</strong> ${cita.notas}</p>
            </div>
          ` : ''}
          
          <button class="btn btn-primary" onclick="cambiarEstadoCita(${cita.id})" style="width: 100%;">
            <i class="fas fa-edit"></i> Cambiar Estado de la Cita
          </button>
        </div>
      `;
    }).join('');
}

// ========================================
// MIS CLIENTES
// ========================================

function renderMisClientes() {
  const tbody = document.getElementById('misClientesTable');
  
  if (!tbody) {
    console.error('Elemento misClientesTable no encontrado');
    return;
  }
  
  // Obtener clientes únicos de mis reservas
  const clientesIds = [...new Set(misReservas.map(r => r.id_usuario))];
  const misClientes = allUsuarios.filter(u => clientesIds.includes(u.id));

  if (misClientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay clientes asignados</td></tr>';
    return;
  }

  tbody.innerHTML = misClientes.map(cliente => {
    const citasCliente = misReservas.filter(r => r.id_usuario === cliente.id);
    const ultimaCita = citasCliente
      .filter(c => c.fecha)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

    return `
      <tr>
        <td><strong>${cliente.nombre}</strong></td>
        <td>${cliente.email}</td>
        <td>${cliente.telefono || 'N/A'}</td>
        <td>${citasCliente.length}</td>
        <td>${ultimaCita ? formatDate(ultimaCita.fecha) : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

// ========================================
// PERFIL
// ========================================

function renderPerfil() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  // Buscar usuario en allUsuarios
  const usuario = allUsuarios.find(u => u.id == userId);
  
  const updateElement = (id, html) => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = html;
  };
  
  updateElement('perfilNombre', userName);
  updateElement('perfilEmail', `<i class="fas fa-envelope"></i> ${usuario?.email || 'No registrado'}`);
  updateElement('perfilTelefono', `<i class="fas fa-phone"></i> ${usuario?.telefono || 'No registrado'}`);
  updateElement('perfilEspecialidad', `<i class="fas fa-star"></i> Especialidad: ${empleadoInfo?.especialidad || 'General'}`);
  
  // Estadísticas
  const completadas = misReservas.filter(r => r.estado === 'completada').length;
  updateElement('perfilTotalCitas', misReservas.length);
  updateElement('perfilCompletadas', completadas);
}

// ========================================
// ACCIONES
// ========================================

async function cambiarEstadoCita(citaId) {
  const cita = misReservas.find(r => r.id === citaId);
  if (!cita) return;

  const nuevoEstado = await showPrompt(
    `Estado actual: ${cita.estado}\n\nNuevo estado:\n1. pendiente\n2. confirmada\n3. completada\n4. cancelada\n\nIngrese el número:`,
    'Cambiar Estado de Cita',
    ''
  );

  if (!nuevoEstado || nuevoEstado < 1 || nuevoEstado > 4) return;

  const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];
  const estado = estados[parseInt(nuevoEstado) - 1];

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${getApiUrl()}/reservas/${citaId}?estado=${encodeURIComponent(estado)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar cita');
    }

    showToast(`✅ Cita actualizada a: ${estado}`, 'success');
    await loadAllData();
    
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message || 'Error al cambiar estado de cita', 'error');
  }
}

// ========================================
// UTILIDADES
// ========================================

function formatHora(hora) {
  if (!hora) return '00:00';
  // Convertir a string si no lo es
  const horaStr = String(hora);
  // Si ya tiene formato HH:MM:SS o HH:MM, extraer solo HH:MM
  if (horaStr.includes(':')) {
    return horaStr.substring(0, 5);
  }
  return horaStr;
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const timeElement = document.getElementById('currentTime');
  if (timeElement) {
    timeElement.textContent = time;
  }
}

function updateFecha() {
  const now = new Date();
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fecha = now.toLocaleDateString('es-MX', opciones);
  const fechaElement = document.getElementById('fechaHoy');
  if (fechaElement) {
    fechaElement.textContent = fecha;
  }
}

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
  
  .role-badge.empleado { 
    background: #10b981; 
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
`;
document.head.appendChild(style);
