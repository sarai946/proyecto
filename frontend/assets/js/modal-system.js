// ========================================
// SISTEMA DE MODALES REUTILIZABLE
// ========================================

// Crear el contenedor de modales si no existe
function initModalSystem() {
  if (document.getElementById('modalSystem')) return;
  
  const modalHTML = `
    <!-- Modal de Alerta/Info -->
    <div id="modalAlert" class="modal-overlay" style="display: none;">
      <div class="modal-box modal-small">
        <div class="modal-header">
          <h3 id="modalAlertTitle">Información</h3>
          <button class="modal-close" onclick="closeModalAlert()">&times;</button>
        </div>
        <div class="modal-body">
          <p id="modalAlertMessage"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModalAlert()">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div id="modalConfirm" class="modal-overlay" style="display: none;">
      <div class="modal-box modal-small">
        <div class="modal-header">
          <h3 id="modalConfirmTitle">Confirmar</h3>
          <button class="modal-close" onclick="closeModalConfirm(false)">&times;</button>
        </div>
        <div class="modal-body">
          <p id="modalConfirmMessage"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModalConfirm(false)">Cancelar</button>
          <button class="btn btn-primary" onclick="closeModalConfirm(true)">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Prompt -->
    <div id="modalPrompt" class="modal-overlay" style="display: none;">
      <div class="modal-box modal-small">
        <div class="modal-header">
          <h3 id="modalPromptTitle">Ingrese información</h3>
          <button class="modal-close" onclick="closeModalPrompt(null)">&times;</button>
        </div>
        <div class="modal-body">
          <p id="modalPromptMessage"></p>
          <input type="text" id="modalPromptInput" class="modal-input" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModalPrompt(null)">Cancelar</button>
          <button class="btn btn-primary" onclick="closeModalPrompt('submit')">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Información de Usuario -->
    <div id="modalUserInfo" class="modal-overlay" style="display: none;">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Información del Usuario</h3>
          <button class="modal-close" onclick="closeModalUserInfo()">&times;</button>
        </div>
        <div class="modal-body" id="modalUserInfoContent">
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModalUserInfo()">Aceptar</button>
        </div>
      </div>
    </div>
  `;
  
  const container = document.createElement('div');
  container.id = 'modalSystem';
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
  
  // Agregar estilos si no existen
  if (!document.getElementById('modalSystemStyles')) {
    const style = document.createElement('style');
    style.id = 'modalSystemStyles';
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
      }
      
      .modal-box {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        overflow: hidden;
      }
      
      .modal-box.modal-small {
        max-width: 400px;
      }
      
      .modal-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s;
      }
      
      .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .modal-body {
        padding: 24px;
      }
      
      .modal-body p {
        margin: 0 0 16px 0;
        color: #2d3748;
        line-height: 1.6;
      }
      
      .modal-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        font-family: 'Poppins', sans-serif;
        transition: border-color 0.3s;
      }
      
      .modal-input:focus {
        outline: none;
        border-color: #667eea;
      }
      
      .modal-footer {
        padding: 16px 24px;
        background: #f8f9fa;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid #e2e8f0;
      }
      
      .modal-footer .btn {
        padding: 10px 24px;
        border-radius: 8px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.3s;
        font-family: 'Poppins', sans-serif;
      }
      
      .modal-footer .btn-secondary {
        background: #e2e8f0;
        color: #2d3748;
      }
      
      .modal-footer .btn-secondary:hover {
        background: #cbd5e0;
      }
      
      .modal-footer .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      
      .modal-footer .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from {
          transform: translateY(-50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Variables para callbacks
let confirmCallback = null;
let promptCallback = null;

// Función para mostrar alerta
function showAlert(message, title = 'Información') {
  initModalSystem();
  document.getElementById('modalAlertTitle').textContent = title;
  document.getElementById('modalAlertMessage').textContent = message;
  document.getElementById('modalAlert').style.display = 'flex';
}

function closeModalAlert() {
  document.getElementById('modalAlert').style.display = 'none';
}

// Función para mostrar confirmación
function showConfirm(message, title = 'Confirmar') {
  initModalSystem();
  return new Promise((resolve) => {
    confirmCallback = resolve;
    document.getElementById('modalConfirmTitle').textContent = title;
    document.getElementById('modalConfirmMessage').textContent = message;
    document.getElementById('modalConfirm').style.display = 'flex';
  });
}

function closeModalConfirm(result) {
  document.getElementById('modalConfirm').style.display = 'none';
  if (confirmCallback) {
    confirmCallback(result);
    confirmCallback = null;
  }
}

// Función para mostrar prompt
function showPrompt(message, title = 'Ingrese información', defaultValue = '') {
  initModalSystem();
  return new Promise((resolve) => {
    promptCallback = resolve;
    document.getElementById('modalPromptTitle').textContent = title;
    document.getElementById('modalPromptMessage').textContent = message;
    const input = document.getElementById('modalPromptInput');
    input.value = defaultValue;
    document.getElementById('modalPrompt').style.display = 'flex';
    
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
    
    // Enter para aceptar
    input.onkeypress = (e) => {
      if (e.key === 'Enter') closeModalPrompt('submit');
    };
  });
}

function closeModalPrompt(action) {
  const input = document.getElementById('modalPromptInput');
  const value = action === 'submit' ? input.value : null;
  document.getElementById('modalPrompt').style.display = 'none';
  
  if (promptCallback) {
    promptCallback(value);
    promptCallback = null;
  }
}

// Función para mostrar información de usuario
function showUserInfo(userData) {
  initModalSystem();
  const content = `
    <div style="padding: 10px;">
      <p><strong>ID:</strong> ${userData.id}</p>
      <p><strong>Nombre:</strong> ${userData.nombre}</p>
      <p><strong>Email:</strong> ${userData.email || 'No disponible'}</p>
      <p><strong>Teléfono:</strong> ${userData.telefono || 'No disponible'}</p>
      <p><strong>Rol:</strong> ${userData.rol}</p>
      <p><strong>Fecha de registro:</strong> ${userData.creado_en || 'N/A'}</p>
      <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p><strong>Reservas totales:</strong> ${userData.reservas_totales || 0}</p>
      <p><strong>Reservas completadas:</strong> ${userData.reservas_completadas || 0}</p>
      <p><strong>Reservas canceladas:</strong> ${userData.reservas_canceladas || 0}</p>
    </div>
  `;
  document.getElementById('modalUserInfoContent').innerHTML = content;
  document.getElementById('modalUserInfo').style.display = 'flex';
}

function closeModalUserInfo() {
  document.getElementById('modalUserInfo').style.display = 'none';
}

// Cerrar modales al hacer clic fuera
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    if (e.target.id === 'modalAlert') closeModalAlert();
    if (e.target.id === 'modalConfirm') closeModalConfirm(false);
    if (e.target.id === 'modalPrompt') closeModalPrompt(null);
    if (e.target.id === 'modalUserInfo') closeModalUserInfo();
  }
});

// Exportar funciones globales
window.showAlert = showAlert;
window.showConfirm = showConfirm;
window.showPrompt = showPrompt;
window.showUserInfo = showUserInfo;
window.closeModalAlert = closeModalAlert;
window.closeModalConfirm = closeModalConfirm;
window.closeModalPrompt = closeModalPrompt;
window.closeModalUserInfo = closeModalUserInfo;

// Inicializar al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModalSystem);
} else {
  initModalSystem();
}
