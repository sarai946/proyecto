
Yary Nails - Backend (Flask)
============================

Estructura:
- app.py               -> Aplicación Flask
- templates/index.html -> Página principal con formulario
- static/css/style.css -> Estilos
- static/docs/         -> Contiene Requerimientos_Yary_Nails.pdf
- data/messages.db     -> (Se crea al ejecutar) Base SQLite con mensajes
- requirements.txt     -> Dependencias

Cómo ejecutar (local):
1. Crear un entorno virtual python y activarlo.
2. pip install -r requirements.txt
3. python app.py
4. Abrir http://localhost:5000

Administración de mensajes:
- Para ver los mensajes en desarrollo, visita:
  http://localhost:5000/admin/messages?key=adminpass
  (Cambia la clave ADMIN_KEY en app.py antes de desplegar.)

Notas:
- Reemplaza static/img/hero.jpg por la imagen real del proyecto.
- El PDF con los requerimientos ya está en static/docs/Requerimientos_Yary_Nails.pdf
