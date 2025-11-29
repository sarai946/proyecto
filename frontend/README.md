# 💅 Yary Nails Studio - Proyecto Full Stack

## 📁 Estructura del Proyecto

```
proyecto/
├── fronend/              # Frontend HTML/CSS/JS (USAR ESTA)
│   ├── index.html
│   ├── reservas.html
│   ├── contacto.html
│   ├── assets/
│   │   ├── js/
│   │   │   ├── config.js       # Configuración API
│   │   │   ├── script.js       # Scripts principales
│   │   │   └── reservas.js     # Gestión de reservas
│   │   └── img/
│   └── style.css
│
├── backend/              # Backend Python FastAPI
│   ├── api/
│   │   ├── main.py           # API principal
│   │   ├── db_connection.py  # Conexión a Railway
│   │   └── .env             # Variables de entorno
│   └── import_to_railway.py
│
└── frontend/             # ❌ NO USAR (React - obsoleto)
```

## 🚀 Cómo Ejecutar el Proyecto

### 1️⃣ Backend (FastAPI)

```powershell
# Ir al directorio del backend
cd backend\api

# Activar entorno virtual
.\entornoV\Scripts\Activate.ps1

# Instalar dependencias (si es necesario)
pip install fastapi uvicorn mysql-connector-python python-dotenv

# Ejecutar servidor
uvicorn main:app --reload
```

El backend estará disponible en: `http://localhost:8000`

### 2️⃣ Frontend (HTML)

```powershell
# Ir al directorio fronend
cd fronend

# Opción 1: Abrir directamente en navegador
start index.html

# Opción 2: Usar servidor HTTP simple
python -m http.server 8080
```

El frontend estará disponible en: `http://localhost:8080`

## 🔧 Configuración

### Backend - Variables de Entorno

Edita `backend/api/.env`:

```env
# Para Railway (producción)
MYSQL_HOST=shinkansen.proxy.rlwy.net
MYSQL_PORT=26272
MYSQL_USER=root
MYSQL_PASSWORD=tu_password_railway
MYSQL_DATABASE=railway

# Para XAMPP (desarrollo local) - descomenta estas líneas
# MYSQL_HOST=localhost
# MYSQL_PORT=3306
# MYSQL_USER=root
# MYSQL_PASSWORD=
# MYSQL_DATABASE=yary_nails
```

### Frontend - Configuración API

Edita `fronend/assets/js/config.js`:

```javascript
const API_CONFIG = {
  // Para desarrollo local
  baseURL: 'http://localhost:8000',
  
  // Para producción (cuando despliegues el backend)
  // baseURL: 'https://tu-backend-railway.railway.app',
};
```

## 📊 Base de Datos

### Tablas en Railway:
- `usuarios` - Usuarios del sistema
- `reservas` - Reservas de clientes
- `empleados` - Empleados del salón
- `servicios` - Servicios ofrecidos
- `contacto` - Mensajes de contacto
- `logs` - Registro de actividades
- `tokens_recuperacion` - Tokens para recuperación de contraseña

## 🌐 Endpoints API Disponibles

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios
- `GET /usuarios/{id}` - Obtener usuario específico
- `POST /usuarios` - Crear usuario
- `PUT /usuarios/{id}` - Actualizar usuario
- `DELETE /usuarios/{id}` - Eliminar usuario

### Reservas
- `GET /reservas` - Obtener todas las reservas
- `GET /reservas/{id}` - Obtener reserva específica
- `POST /reservas` - Crear reserva
- `PUT /reservas/{id}` - Actualizar reserva
- `DELETE /reservas/{id}` - Eliminar reserva

### Utilidades
- `GET /` - Verificar que la API funciona
- `GET /tablas` - Listar tablas disponibles

## 🗑️ Eliminar Carpeta React (frontend)

La carpeta `frontend/` contiene un proyecto React que ya no se usa. Puedes eliminarla:

```powershell
# Desde la raíz del proyecto
Remove-Item -Recurse -Force frontend
```

## ✅ Verificar Conexión

### 1. Verificar Backend
```powershell
cd backend
python verificar_railway.py
```

### 2. Probar API en navegador
Abre: `http://localhost:8000` (deberías ver un mensaje de bienvenida)
Abre: `http://localhost:8000/docs` (documentación automática de la API)

### 3. Probar Frontend
Abre `fronend/reservas.html` y crea una reserva de prueba.

## 🔐 Seguridad

⚠️ **IMPORTANTE**: No subas el archivo `.env` a GitHub. Ya está en `.gitignore`.

## 📝 Notas

- El frontend usa **HTML, CSS y JavaScript vanilla** (sin frameworks)
- El backend usa **FastAPI** con conexión a **MySQL en Railway**
- La base de datos está en la nube (Railway), no en XAMPP local
- Para cambiar entre local y Railway, edita el archivo `.env`

## 🆘 Solución de Problemas

### Error "Access denied" en Railway
- Verifica que la contraseña en `.env` sea correcta
- Copia la contraseña directamente desde Railway > Variables

### Error "CORS" en el navegador
- El backend ya tiene CORS configurado
- Asegúrate de que el backend esté corriendo

### Error "Cannot connect to backend"
- Verifica que `uvicorn` esté corriendo en puerto 8000
- Revisa `config.js` que tenga la URL correcta

---

**Desarrollado con ❤️ para Yary Nails Studio**
