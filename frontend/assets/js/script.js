
document.addEventListener('DOMContentLoaded', function(){
  // Fade-in animation for body content
  document.body.classList.add('fade-enter-active');

  // Reservation form handling (shows modal confirmation and sends to backend)
  const form = document.getElementById('reservation-form');
  const modalBack = document.getElementById('modal-backdrop');
  const modalMsg = document.getElementById('modal-message');

  if(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      
      // Obtener datos del formulario
      const formData = new FormData(form);
      const reserva = {
        cliente: formData.get('nombre'),
        telefono: formData.get('telefono'),
        fecha: formData.get('fecha'),
        hora: formData.get('hora'),
        empleado: 'Por asignar' // Por defecto
      };
      
      try {
        // Enviar al backend
        const response = await apiRequest('/reservas', {
          method: 'POST',
          body: JSON.stringify(reserva)
        });
        
        // Mostrar mensaje de éxito
        modalMsg.innerHTML = `
          <div class="icon">✅</div>
          <h3>¡Reserva enviada con éxito!</h3>
          <p>Gracias por elegir <strong>Yary Nails Studio – Beauty Atelier</strong> 💅</p>
          <p><small>Reserva #${response.id}</small></p>
        `;
        modalBack.classList.add('show');
        
        // auto-hide after 3.5s
        setTimeout(()=>{modalBack.classList.remove('show')}, 3500);
        form.reset();
        
      } catch (error) {
        // Mostrar error
        modalMsg.innerHTML = `
          <div class="icon">❌</div>
          <h3>Error al enviar reserva</h3>
          <p>${error.message}</p>
          <p><small>Por favor, verifica que el backend esté corriendo.</small></p>
        `;
        modalBack.classList.add('show');
        setTimeout(()=>{modalBack.classList.remove('show')}, 4000);
      }
    });
  }

  // Close modal on backdrop click
  if(modalBack){
    modalBack.addEventListener('click', function(e){
      if(e.target === modalBack) modalBack.classList.remove('show');
    });
  }
});
