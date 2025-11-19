/* empleado.js
   Funcionalidad: localStorage, CRUD, filtros, búsqueda y export CSV.
*/

(() => {
  // Elementos DOM
  const tbody = document.getElementById('employeesTbody');
  const totalCount = document.getElementById('totalCount');
  const q = document.getElementById('q');
  const openAdd = document.getElementById('openAdd');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const empForm = document.getElementById('empForm');
  const modalTitle = document.getElementById('modalTitle');
  const exportCsv = document.getElementById('exportCsv');
  const filterRole = document.getElementById('filterRole');
  const filterStatus = document.getElementById('filterStatus');
  const applyFilters = document.getElementById('applyFilters');

  const STORAGE_KEY = 'yary_employees_v1';

  // Demo inicial si localStorage vacío
  const seed = [
    {id:1,name:'Ana Pérez',role:'Técnica',email:'ana.perez@mail.com',phone:'3001234567',status:'Activo'},
    {id:2,name:'María Rodríguez',role:'Recepción',email:'maria.r@mail.com',phone:'3159876543',status:'Activo'},
    {id:3,name:'Laura Gómez',role:'Administrativa',email:'laura.g@mail.com',phone:'3102223333',status:'Inactivo'}
  ];

  // Cargar desde storage o usar seed
  function loadEmployees(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); return [...seed]; }
      return JSON.parse(raw) || [];
    } catch(e){ console.error('Error leyendo storage', e); return [...seed]; }
  }

  function saveEmployees(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  let employees = loadEmployees();

  // Render tabla
  function render(list){
    tbody.innerHTML = '';
    if(!list.length){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" class="small center">No hay empleados que mostrar</td>`;
      tbody.appendChild(tr);
      totalCount.textContent = 0;
      return;
    }
    list.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(emp.name)}</td>
        <td>${escapeHtml(emp.role)}</td>
        <td>${escapeHtml(emp.email || '-')}</td>
        <td>${escapeHtml(emp.phone || '-')}</td>
        <td><span class="pill ${emp.status === 'Activo' ? 'active' : 'inactive'}">${emp.status}</span></td>
        <td>
          <div class="actions">
            <button class="btn ghost" data-action="edit" data-id="${emp.id}">Editar</button>
            <button class="btn" data-action="delete" data-id="${emp.id}">Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    totalCount.textContent = list.length;
  }

  // Util: escapar texto para evitar XSS cuando mostramos valores
  function escapeHtml(str){
    if(!str && str !== 0) return '';
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  // Inicial render
  applyFiltersAndSearch('');

  // Buscador en tiempo real
  q.addEventListener('input', ()=> applyFiltersAndSearch(q.value.trim().toLowerCase()));

  // Abrir modal nuevo
  openAdd.addEventListener('click', ()=>{
    empForm.reset();
    document.getElementById('empId').value = '';
    modalTitle.textContent = 'Nuevo empleado';
    modal.classList.add('open');
  });

  closeModal.addEventListener('click', ()=> modal.classList.remove('open'));

  // Guardar (añadir/editar)
  empForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const id = document.getElementById('empId').value;
    const name = document.getElementById('name').value.trim();
    const role = document.getElementById('role').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const status = document.getElementById('status').value;

    if(!name || !role) { alert('Por favor completa nombre y cargo.'); return; }

    if(id){
      employees = employees.map(emp => emp.id == id ? {...emp, name, role, email, phone, status} : emp);
    } else {
      const newId = employees.length ? Math.max(...employees.map(e=>e.id)) + 1 : 1;
      employees.push({id:newId, name, role, email, phone, status});
    }
    saveEmployees(employees);
    modal.classList.remove('open');
    applyFiltersAndSearch(q.value.trim().toLowerCase());
  });

  // Delegación para botones de editar / eliminar
  tbody.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('button');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if(action === 'edit') return editEmployee(id);
    if(action === 'delete') return deleteEmployee(id);
  });

  // Editar
  window.editEmployee = function(id){
    const emp = employees.find(e => e.id == id);
    if(!emp) return alert('Empleado no encontrado');
    document.getElementById('empId').value = emp.id;
    document.getElementById('name').value = emp.name;
    document.getElementById('role').value = emp.role;
    document.getElementById('email').value = emp.email || '';
    document.getElementById('phone').value = emp.phone || '';
    document.getElementById('status').value = emp.status || 'Activo';
    modalTitle.textContent = 'Editar empleado';
    modal.classList.add('open');
  };

  // Eliminar
  window.deleteEmployee = function(id){
    if(!confirm('¿Eliminar este empleado?')) return;
    employees = employees.filter(e => e.id != id);
    saveEmployees(employees);
    applyFiltersAndSearch(q.value.trim().toLowerCase());
  };

  // Exportar CSV
  exportCsv.addEventListener('click', ()=>{
    if(!employees.length) return alert('No hay empleados para exportar');
    const header = ['id','name','role','email','phone','status'];
    const rows = employees.map(e => header.map(h => `"${(e[h]||'').toString().replace(/"/g,'""')}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'empleados.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // Filtros
  applyFilters.addEventListener('click', ()=> applyFiltersAndSearch(q.value.trim().toLowerCase()));

  function applyFiltersAndSearch(searchTerm=''){
    let list = [...employees];
    const roleVal = filterRole.value;
    const statusVal = filterStatus.value;
    if(roleVal) list = list.filter(l => l.role === roleVal);
    if(statusVal) list = list.filter(l => l.status === statusVal);
    if(searchTerm) list = list.filter(l => (l.name + ' ' + l.role + ' ' + (l.email||'')).toLowerCase().includes(searchTerm));
    render(list);
  }

  // Cerrar modal con Escape al presionar
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') modal.classList.remove('open'); });

})();
