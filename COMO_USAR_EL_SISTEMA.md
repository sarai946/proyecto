# 🚀 Cómo Usar el Sistema - Yary Nails Studio

## ✅ Estado Actual del Sistema

- **Backend:** ✅ Corriendo en `http://localhost:8000`
- **Frontend:** ✅ Configurado para usar localhost
- **Base de Datos:** ✅ MySQL en Railway conectada

---

## 🔐 Credenciales de Prueba

### ADMINISTRADOR
```
Email: admin@yarynails.com
Contraseña: admin123
```

### EMPLEADO
```
Email: empleado@yarynails.com
Contraseña: empleado123
```

### CLIENTE
```
Email: cliente@example.com
Contraseña: cliente123
```

---

## 📝 Pasos para Usar el Sistema

### 1️⃣ **Si no puedes iniciar sesión:**

1. Abre `login.html`
2. Haz clic en **"🗑️ Limpiar sesión guardada"** (abajo del formulario)
3. Ingresa tus credenciales
4. Presiona "Iniciar Sesión"

### 2️⃣ **Si te sigue mostrando "admin" automáticamente:**

Abre la consola del navegador (F12) y ejecuta:
```javascript
localStorage.clear();
location.reload();
```

### 3️⃣ **Si ves errores de CORS o conexión:**

Verifica que el backend esté corriendo:
```bash
# En la terminal de VS Code
cd backend/api
python -m uvicorn main:app --reload
```

---

## 🌐 URLs del Sistema

| Página | URL | Descripción |
|--------|-----|-------------|
| Home | `home.html` | Página principal pública |
| Login | `login.html` | Iniciar sesión |
| Registro | `registro.html` | Crear nueva cuenta |
| Dashboard Cliente | `cliente-dashboard.html` | Panel de cliente |
| Dashboard Admin | `admin-dashboard.html` | Panel de administrador |
| Test Login | `test-login.html` | Página de prueba |

---

## 🛠️ Solución de Problemas

### Problema: "No me deja entrar"
**Solución:** 
1. Limpia localStorage
2. Verifica que el backend esté corriendo
3. Abre la consola (F12) y busca errores

### Problema: "Me redirige automáticamente"
**Solución:**
- Tienes una sesión activa
- Haz clic en "Limpiar sesión guardada"
- O cierra sesión desde el dashboard

### Problema: "Error de conexión"
**Solución:**
- El backend debe estar corriendo en `http://localhost:8000`
- Verifica en la terminal de VS Code que diga "Uvicorn running"

---

## 🔄 Cómo Cambiar de Cuenta

1. Si estás en un dashboard, haz clic en **"Cerrar Sesión"**
2. Te redirigirá a `login.html`
3. Ingresa las nuevas credenciales
4. Serás redirigido según el rol de la nueva cuenta

---

## 📊 Datos Almacenados en LocalStorage

Cuando inicias sesión, se guardan:
```javascript
token         // JWT del backend
userId        // ID del usuario (número)
userName      // Nombre del usuario
userRole      // admin | empleado | cliente
```

Para ver qué hay guardado:
```javascript
// En consola (F12)
console.log({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  userName: localStorage.getItem('userName'),
  userRole: localStorage.getItem('userRole')
});
```

---

## ✨ Características del Sistema

### Dashboard Cliente
- Ver perfil y estadísticas
- Agendar citas
- Ver servicios disponibles
- Cancelar reservas
- Mini-carrusel de trabajos
- Galería completa

### Dashboard Admin
- Ver todos los usuarios
- Gestionar todas las reservas
- Ver servicios y empleados
- Cambiar estados de reservas
- Reportes y estadísticas
- 6 secciones completas

### Dashboard Empleado
- (Por implementar)
- Ver reservas asignadas
- Actualizar estados

---

## 🎨 Tema del Sistema

Color principal: `#667eea` (morado)
Color secundario: `#764ba2` (morado oscuro)

---

**Última actualización:** 2 de diciembre de 2025  
**Estado:** ✅ Sistema operativo con backend local
