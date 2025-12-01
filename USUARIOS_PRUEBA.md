# 🎀 Yary Nails Studio - Guía de Usuarios Predefinidos

## 📋 Usuarios de Prueba Creados

### 🔐 Credenciales de Acceso

**Contraseña para TODOS los usuarios:** `Pass123!`

---

## 👨‍💼 ADMINISTRADOR

### Admin Principal
- **Email:** `admin@yarynails.com`
- **Contraseña:** `Pass123!`
- **Rol:** Administrador
- **Dashboard:** `/admin-dashboard.html`

**Funcionalidades:**
- ✅ Gestión completa de usuarios
- ✅ Gestión de reservas
- ✅ Gestión de servicios
- ✅ Gestión de empleados
- ✅ Reportes y estadísticas
- ✅ Configuración del sistema

---

## 💅 EMPLEADAS (Especialistas)

### María García
- **Email:** `maria@yarynails.com`
- **Contraseña:** `Pass123!`
- **Rol:** Empleada
- **Dashboard:** `/empleado-dashboard.html`

### Ana Rodríguez
- **Email:** `ana@yarynails.com`
- **Contraseña:** `Pass123!`
- **Rol:** Empleada
- **Dashboard:** `/empleado-dashboard.html`

### Laura Martínez
- **Email:** `laura@yarynails.com`
- **Contraseña:** `Pass123!`
- **Rol:** Empleada
- **Dashboard:** `/empleado-dashboard.html`

**Funcionalidades:**
- ✅ Ver su agenda personal
- ✅ Ver citas del día
- ✅ Gestionar citas asignadas
- ✅ Ver historial de clientes atendidos
- ✅ Estadísticas personales

---

## 👥 CLIENTES

### Sofia López
- **Email:** `sofia@example.com`
- **Contraseña:** `Pass123!`
- **Rol:** Cliente

### Isabella Hernández
- **Email:** `isabella@example.com`
- **Contraseña:** `Pass123!`
- **Rol:** Cliente

### Valentina González
- **Email:** `valentina@example.com`
- **Contraseña:** `Pass123!`
- **Rol:** Cliente

### Camila Pérez
- **Email:** `camila@example.com`
- **Contraseña:** `Pass123!`
- **Rol:** Cliente

### Emma Sánchez
- **Email:** `emma@example.com`
- **Contraseña:** `Pass123!`
- **Rol:** Cliente

**Dashboard:** `/cliente-dashboard.html`

**Funcionalidades:**
- ✅ Agendar nuevas citas
- ✅ Ver mis reservas activas
- ✅ Ver historial de citas
- ✅ Explorar servicios
- ✅ Gestionar perfil personal

---

## 🚀 Instrucciones de Uso

### 1. Ejecutar el Script SQL

```bash
# Desde la terminal en backend/api
python -c "import mysql.connector; import os; from dotenv import load_dotenv; load_dotenv(); conn = mysql.connector.connect(host=os.getenv('MYSQL_HOST'), port=int(os.getenv('MYSQL_PORT')), user=os.getenv('MYSQL_USER'), password=os.getenv('MYSQL_PASSWORD'), database=os.getenv('MYSQL_DATABASE')); cursor = conn.cursor(); cursor.execute(open('../usuarios_predefinidos.sql', 'r').read()); conn.commit(); print('Usuarios insertados exitosamente')"
```

O manualmente desde MySQL Workbench o cualquier cliente MySQL:
1. Conectar a Railway MySQL
2. Abrir el archivo `backend/usuarios_predefinidos.sql`
3. Ejecutar el script completo

### 2. Iniciar el Backend

```bash
cd backend/api
uvicorn main:app --reload
```

### 3. Abrir el Frontend

```bash
cd frontend
start home.html
```

### 4. Probar el Login

1. Ir a http://localhost:8000 (o abrir `home.html`)
2. Click en "Iniciar Sesión"
3. Usar cualquiera de las credenciales de arriba
4. Serás redirigido al dashboard correspondiente según tu rol

---

## 🔄 Flujo de Navegación

```
home.html
  ↓
login.html → Autenticación
  ↓
┌─────────────┬──────────────────┬──────────────────┐
│   Admin     │    Empleada      │     Cliente      │
↓             ↓                  ↓
admin-        empleado-          cliente-
dashboard     dashboard          dashboard
```

---

## 📝 Notas Importantes

1. **Seguridad:** Las contraseñas están hasheadas con bcrypt en la base de datos
2. **Tokens JWT:** Las sesiones se manejan con tokens JWT de 24 horas
3. **Roles:** El sistema valida roles tanto en frontend como backend
4. **Navegación:** No se puede volver atrás después de cerrar sesión

---

## 🐛 Solución de Problemas

### Error al iniciar sesión
- Verificar que el backend esté corriendo
- Verificar que los usuarios estén en la base de datos
- Revisar consola del navegador para errores

### No se cargan los datos en el dashboard
- Verificar conexión a la base de datos Railway
- Revisar que las tablas tengan datos
- Verificar en DevTools → Network si las peticiones fallan

### Dashboard muestra "Cargando..."
- Asegurarse de que el backend responde en `http://localhost:8000`
- Verificar que el token JWT sea válido
- Revisar logs del servidor

---

## 📧 Contacto

Para problemas técnicos o preguntas, contactar al administrador del sistema.

---

**Última actualización:** 30 de noviembre de 2025
