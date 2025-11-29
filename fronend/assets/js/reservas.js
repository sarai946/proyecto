// ==========================
//  Gestión de Reservas · Yary Nails
// ==========================

// Elementos del DOM
const tbody = document.getElementById("reservasTbody");
const totalCount = document.getElementById("totalCount");
const modal = document.getElementById("modal");
const openAdd = document.getElementById("openAdd");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("reservaForm");
const modalTitle = document.getElementById("modalTitle");
const searchInput = document.getElementById("q");
const exportCsv = document.getElementById("exportCsv");
const filterEmployee = document.getElementById("filterEmployee");
const filterDate = document.getElementById("filterDate");
const applyFilters = document.getElementById("applyFilters");

// Campos del formulario
const idInput = document.getElementById("reservaId");
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const clienteInput = document.getElementById("cliente");
const empleadoInput = document.getElementById("empleado");
const telefonoInput = document.getElementById("telefono");

// ==========================
//  Variables globales
// ==========================
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
let editMode = false;

// ==========================
//  Funciones principales
// ==========================

// Renderizar lista de reservas
function renderReservas(lista = reservas) {
  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">No hay reservas registradas</td></tr>`;
    totalCount.textContent = 0;
    return;
  }

  lista.forEach((r, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.fecha}</td>
      <td>${r.hora}</td>
      <td>${r.cliente}</td>
      <td>${r.empleado}</td>
      <td>${r.telefono}</td>
      <td>
        <button class="btn small" onclick="editReserva(${index})">Editar</button>
        <button class="btn ghost small" onclick="deleteReserva(${index})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  totalCount.textContent = lista.length;
}

// Guardar en localStorage
function saveReservas() {
  localStorage.setItem("reservas", JSON.stringify(reservas));
  renderReservas();
}

// ==========================
//  CRUD (Crear, Editar, Eliminar)
// ==========================

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    fecha: fechaInput.value,
    hora: horaInput.value,
    cliente: clienteInput.value,
    empleado: empleadoInput.value,
    telefono: telefonoInput.value,
  };

  if (editMode) {
    const index = parseInt(idInput.value);
    reservas[index] = data;
    editMode = false;
  } else {
    reservas.push(data);
  }

  saveReservas();
  closeModalFunc();
  form.reset();
});

function editReserva(index) {
  const r = reservas[index];
  idInput.value = index;
  fechaInput.value = r.fecha;
  horaInput.value = r.hora;
  clienteInput.value = r.cliente;
  empleadoInput.value = r.empleado;
  telefonoInput.value = r.telefono;

  modalTitle.textContent = "Editar reserva";
  modal.classList.add("open");
  editMode = true;
}

function deleteReserva(index) {
  if (confirm("¿Eliminar esta reserva?")) {
    reservas.splice(index, 1);
    saveReservas();
  }
}

// ==========================
//  Filtros y búsqueda
// ==========================

applyFilters.addEventListener("click", () => {
  const empleado = filterEmployee.value.toLowerCase();
  const fecha = filterDate.value;

  const filtradas = reservas.filter((r) => {
    const matchEmpleado = empleado ? r.empleado.toLowerCase().includes(empleado) : true;
    const matchFecha = fecha ? r.fecha === fecha : true;
    return matchEmpleado && matchFecha;
  });

  renderReservas(filtradas);
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtradas = reservas.filter((r) =>
    r.cliente.toLowerCase().includes(q) ||
    r.empleado.toLowerCase().includes(q) ||
    r.fecha.toLowerCase().includes(q)
  );
  renderReservas(filtradas);
});

// ==========================
//  Exportar a CSV
// ==========================
exportCsv.addEventListener("click", () => {
  if (reservas.length === 0) {
    alert("No hay reservas para exportar.");
    return;
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    ["Fecha,Hora,Cliente,Empleado,Teléfono", ...reservas.map(r =>
      `${r.fecha},${r.hora},${r.cliente},${r.empleado},${r.telefono}`
    )].join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "reservas.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ==========================
//  Modal control
// ==========================
function closeModalFunc() {
  modal.classList.remove("open");
  form.reset();
  modalTitle.textContent = "Nueva reserva";
  editMode = false;
}

openAdd.addEventListener("click", () => {
  modal.classList.add("open");
});

closeModal.addEventListener("click", closeModalFunc);

// Cerrar modal con fondo oscuro
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFunc();
});

// ==========================
//  Inicialización
// ==========================
renderReservas();
