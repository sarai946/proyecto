# 🔑 Credenciales de Prueba - Yary Nails Studio

## ✅ Problemas Solucionados

1. **URL del backend actualizada** a Railway (no más localhost)
2. **Variables de token unificadas** (`token` en lugar de `auth_token`)
3. **Sistema de autenticación sincronizado** entre login y dashboards

---

## 👤 Cuentas de Prueba

### ADMINISTRADOR
- **Email:** admin@yarynails.com
- **Contraseña:** admin123
- **Dashboard:** admin-dashboard.html
- **Permisos:** Ver todo, gestionar usuarios, reservas, servicios, empleados

### EMPLEADO
- **Email:** empleado@yarynails.com
- **Contraseña:** empleado123
- **Dashboard:** empleado-dashboard.html
- **Permisos:** Ver reservas asignadas, actualizar estados

### CLIENTE
- **Email:** cliente@example.com
- **Contraseña:** cliente123
- **Dashboard:** cliente-dashboard.html
- **Permisos:** Agendar citas, ver perfil, gestionar reservas

---

## 🔧 Cómo Crear Nuevas Cuentas

### Opción 1: Desde el Frontend
1. Ve a `registro.html`
2. Completa el formulario
3. La contraseña se guardará encriptada con Argon2

### Opción 2: Directamente en la Base de Datos
```sql
-- Insertar nuevo usuario (la contraseña será hasheada por el backend)
INSERT INTO usuarios (nombre, email, password, telefono, rol)
VALUES ('Nuevo Usuario', 'nuevo@email.com', 'password123', '1234567890', 'cliente');
```

---

## 🚨 Troubleshooting

### "Error al iniciar sesión"
1. **Verifica** que el backend en Railway esté activo
2. **Abre** la consola del navegador (F12) para ver errores
3. **Comprueba** que las credenciales sean correctas

### "No me redirige al dashboard"
1. **Verifica** que el rol del usuario sea correcto
2. **Limpia** localStorage: `localStorage.clear()` en consola
3. **Recarga** la página e intenta de nuevo

### "No puedo volver a entrar después de cerrar sesión"
- Esto ya está **corregido**
- Ahora usa los nombres correctos de variables
- El token se guarda como `token` (no `auth_token`)

---

## 📝 Datos Almacenados en LocalStorage

Cuando inicias sesión, se guardan:
```javascript
localStorage.setItem('token', 'JWT_TOKEN_AQUÍ');
localStorage.setItem('userId', '123');
localStorage.setItem('userName', 'Nombre del Usuario');
localStorage.setItem('userRole', 'admin|empleado|cliente');
```

Para **cerrar sesión manualmente** desde consola:
```javascript
localStorage.clear();
location.reload();
```

---

## 🌐 URLs del Sistema

- **Backend API:** https://proyecto-production-e6e2.up.railway.app
- **Login:** login.html
- **Registro:** registro.html
- **Dashboard Admin:** admin-dashboard.html
- **Dashboard Cliente:** cliente-dashboard.html
- **Home:** home.html

---

## ✨ Características del Sistema de Login

✅ Autenticación con JWT  
✅ Contraseñas hasheadas con Argon2id  
✅ Recordar sesión (30 días)  
✅ Redirección automática según rol  
✅ Validación de sesión en dashboards  
✅ Logout funcional en todos los dashboards  

---

**Última actualización:** 2 de diciembre de 2025  
**Estado del sistema:** ✅ Operativo
