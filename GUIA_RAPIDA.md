# 🚀 Guía Rápida - Yary Nails Studio

## ⚠️ IMPORTANTE: Solución de Errores

### 1. Error "ModuleNotFoundError: No module named 'jose'"

El backend necesita el paquete `python-jose`. Para instalarlo:

```powershell
cd backend\api
pip install "python-jose[cryptography]"
```

### 2. Error "No module named 'passlib'"

```powershell
cd backend\api
pip install "passlib[bcrypt]"
```

### 3. Instalar todas las dependencias del backend

```powershell
cd backend\api
pip install fastapi uvicorn mysql-connector-python python-dotenv "python-jose[cryptography]" "passlib[bcrypt]" python-multipart
```

## ▶️ Cómo Ejecutar el Proyecto

### Backend (API)

```powershell
# 1. Ir al directorio del backend
cd backend\api

# 2. Activar entorno virtual (si lo tienes)
.\entornoV\Scripts\Activate.ps1

# 3. Ejecutar el servidor
uvicorn main:app --reload
```

El backend estará disponible en: **http://localhost:8000**

Documentación API: **http://localhost:8000/docs**

### Frontend (Sitio Web)

```powershell
# Ir al directorio frontend
cd frontend

# Abrir en navegador
start index.html
```

O usa un servidor HTTP:

```powershell
cd frontend
python -m http.server 8080
```

Luego abre: **http://localhost:8080**

## 📁 Estructura Correcta del Proyecto

```
proyecto/
├── frontend/          ✅ USAR ESTA CARPETA
│   ├── home.html      (Página principal)
│   ├── login.html
│   ├── contacto.html
│   ├── nosotros.html
│   ├── style.css
│   └── assets/
│       ├── css/
│       │   └── home.css
│       └── js/
│           ├── config.js
│           └── home.js
│
├── backend/
│   └── api/
│       ├── main.py
│       ├── auth.py
│       ├── db_connection.py
│       └── .env
│
└── fronend/          ❌ NO USAR (error de ortografía)
```

## 🔑 Endpoints Disponibles

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener usuario actual

### Usuarios (requiere admin)
- `GET /usuarios` - Listar usuarios

### Reservas
- `GET /reservas` - Listar reservas
- `POST /reservas` - Crear reserva
- `PUT /reservas/{id}` - Actualizar reserva
- `DELETE /reservas/{id}` - Eliminar reserva

## 🔧 Configuración

### Base de Datos (Railway)

Edita `backend/api/.env`:

```env
MYSQL_HOST=shinkansen.proxy.rlwy.net
MYSQL_PORT=26272
MYSQL_USER=root
MYSQL_PASSWORD=kNOiEIMPMCwYqNCWewLGrdCICLfwEjSB
MYSQL_DATABASE=railway
```

### Frontend API

Edita `frontend/assets/js/config.js`:

```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:8000',  // Backend local
};
```

## ✅ Verificar que Todo Funciona

1. ✅ Backend corriendo en puerto 8000
2. ✅ Frontend abierto en navegador
3. ✅ Base de datos Railway conectada
4. ✅ Puedes navegar entre páginas
5. ✅ API responde en /docs

## 🆘 Problemas Comunes

### "Cannot connect to backend"
- Verifica que uvicorn esté corriendo
- Revisa que el puerto sea 8000
- Verifica config.js tiene la URL correcta

### "Access denied" en base de datos
- Verifica las credenciales en .env
- Copia la contraseña exacta desde Railway

### Páginas no cargan CSS
- Verifica que estés en la carpeta `frontend/` (no `fronend/`)
- Revisa que existan los archivos en `assets/css/`

---

**💅 ¡Listo! Tu proyecto Yary Nails Studio está configurado correctamente.**
