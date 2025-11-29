
document.addEventListener('DOMContentLoaded', function(){
  // Fade-in animation for body content
  document.body.classList.add('fade-enter-active');

  // Reservation form handling (shows modal confirmation)
  const form = document.getElementById('reservation-form');
  const modalBack = document.getElementById('modal-backdrop');
  const modalMsg = document.getElementById('modal-message');

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      // normally you'd send data to a server here
      modalMsg.innerHTML = '<div class="icon">✅</div><h3>¡Reserva enviada con éxito!</h3><p>Gracias por elegir <strong>Yary Nails Studio – Beauty Atelier</strong> 💅</p>';
      modalBack.classList.add('show');
      // auto-hide after 3.5s
      setTimeout(()=>{modalBack.classList.remove('show')}, 3500);
      form.reset();
    });
  }

  // Close modal on backdrop click
  if(modalBack){
    modalBack.addEventListener('click', function(e){
      if(e.target === modalBack) modalBack.classList.remove('show');
    });
  }
});
