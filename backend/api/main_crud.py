# main_crud.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from db_connection import conectar
import mysql.connector
from auth import (
    UserLogin, UserRegister, Token,
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_admin, TokenData,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# ========================================
# 🚀 INICIALIZACIÓN DE LA APLICACIÓN
# ========================================

app = FastAPI(
    title="Yary Nails API",
    description="API completa con CRUD para todas las tablas de la base de datos",
    version="4.0.0",
    openapi_tags=[
        {"name": "Auth", "description": "Endpoints de autenticación y autorización"},
        {"name": "Usuarios", "description": "Gestión de usuarios del sistema"},
        {"name": "Empleados", "description": "Gestión de empleados y especialidades"},
        {"name": "Servicios", "description": "Gestión de servicios ofrecidos"},
        {"name": "Reservas", "description": "Gestión de reservas y citas"},
        {"name": "Contacto", "description": "Mensajes de contacto del formulario"},
        {"name": "Logs", "description": "Registro de acciones del sistema"},
        {"name": "Tokens", "description": "Tokens de recuperación de contraseña"},
        {"name": "Sistema", "description": "Información general del sistema"}
    ]
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# 📋 MODELOS PYDANTIC
# ========================================

# Usuarios
class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str
    password: str
    rol: str = "cliente"

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None

# Empleados
class EmpleadoCreate(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str
    especialidad: str
    password: str

class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    especialidad: Optional[str] = None

# Servicios
class ServicioCreate(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    duracion_min: int
    imagen: Optional[str] = None

class ServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    duracion_min: Optional[int] = None
    imagen: Optional[str] = None

# Reservas
class ReservaCreate(BaseModel):
    usuario_id: int
    servicio_id: int
    empleado_id: int
    fecha: str
    hora: str
    estado: str = "pendiente"
    notas: Optional[str] = None

class ReservaUpdate(BaseModel):
    servicio_id: Optional[int] = None
    empleado_id: Optional[int] = None
    fecha: Optional[str] = None
    hora: Optional[str] = None
    estado: Optional[str] = None
    notas: Optional[str] = None

# Contacto
class ContactoCreate(BaseModel):
    nombre: str
    email: EmailStr
    mensaje: str

# Logs
class LogCreate(BaseModel):
    usuario_email: str
    accion: str

# Tokens de recuperación
class TokenRecuperacionCreate(BaseModel):
    email: EmailStr
    token: str
    expiracion: datetime

# ========================================
# 🟢 EVENTO DE INICIO
# ========================================

@app.on_event("startup")
def startup_event():
    conexion = conectar()
    if conexion:
        cursor = conexion.cursor()
        cursor.execute("SHOW TABLES;")
        tablas = cursor.fetchall()
        print("✅ Conexión a MySQL exitosa.")
        print("📋 Tablas en la base de datos:")
        for t in tablas:
            print(f"   - {t[0]}")
        conexion.close()
    else:
        print("❌ Error al conectar con la base de datos.")

# ========================================
# 🏠 RUTA RAÍZ
# ========================================

@app.get("/", tags=["Sistema"])
def root():
    return {
        "message": "🚀 API Yary Nails CRUD Completo",
        "version": "4.0.0",
        "docs": "/docs",
        "tablas": ["usuarios", "empleados", "servicios", "reservas", "contacto", "logs", "tokens_recuperacion"]
    }

@app.get("/tablas", tags=["Sistema"])
def listar_tablas():
    """Listar todas las tablas disponibles en la base de datos"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        cursor.execute("SHOW TABLES;")
        tablas = [t[0] for t in cursor.fetchall()]
        conexion.close()
        return {"tablas_disponibles": tablas}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al listar tablas: {err}")

# ========================================
# 🔐 ENDPOINTS DE AUTENTICACIÓN
# ========================================

@app.post("/auth/register", response_model=Token, tags=["Auth"])
def register(user: UserRegister):
    """Registrar nuevo usuario"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        # Verificar si el email ya existe
        cursor.execute("SELECT email FROM usuarios WHERE email = %s;", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        # Hashear contraseña
        hashed_password = get_password_hash(user.password)
        
        # Insertar usuario
        cursor.execute(
            "INSERT INTO usuarios (nombre, apellido, email, telefono, password, password_hash, rol) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (user.nombre, user.apellido, user.email, user.telefono, hashed_password, hashed_password, user.rol)
        )
        conexion.commit()
        user_id = cursor.lastrowid
        
        # Obtener usuario creado
        cursor.execute("SELECT id, nombre, apellido, email, telefono, rol FROM usuarios WHERE id = %s;", (user_id,))
        usuario = cursor.fetchone()
        conexion.close()
        
        # Crear token
        access_token = create_access_token(
            data={"sub": user.email, "rol": user.rol},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": usuario
        }
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al registrar usuario: {err}")

@app.post("/auth/login", response_model=Token, tags=["Auth"])
def login(credentials: UserLogin):
    """Iniciar sesión"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        # Buscar usuario por email (username es el email)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s;", (credentials.username,))
        usuario = cursor.fetchone()
        conexion.close()
        
        if not usuario:
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
        
        # Verificar contraseña
        if not verify_password(credentials.password, usuario['password']):
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
        
        # Crear token
        access_token = create_access_token(
            data={"sub": usuario['email'], "rol": usuario['rol']},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Remover password antes de enviar
        del usuario['password']
        del usuario['password_hash']
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": usuario
        }
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {err}")

@app.post("/auth/logout", tags=["Auth"])
def logout(current_user: TokenData = Depends(get_current_user)):
    """Cerrar sesión"""
    return {"message": "Sesión cerrada exitosamente"}

@app.get("/auth/me", tags=["Auth"])
def get_me(current_user: TokenData = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        cursor.execute("SELECT id, nombre, apellido, email, telefono, rol FROM usuarios WHERE email = %s;", (current_user.email,))
        usuario = cursor.fetchone()
        conexion.close()
        
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return usuario
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error: {err}")

# ========================================
# 👥 CRUD DE USUARIOS
# ========================================

@app.get("/usuarios", tags=["Usuarios"])
def obtener_usuarios(current_user: TokenData = Depends(get_current_user)):
    """Obtener todos los usuarios"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, apellido, email, telefono, rol, fecha_registro FROM usuarios ORDER BY fecha_registro DESC;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"usuarios": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar usuarios: {err}")

@app.get("/usuarios/{usuario_id}", tags=["Usuarios"])
def obtener_usuario(usuario_id: int, current_user: TokenData = Depends(get_current_user)):
    """Obtener un usuario por ID"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, apellido, email, telefono, rol, fecha_registro FROM usuarios WHERE id = %s;", (usuario_id,))
        usuario = cursor.fetchone()
        conexion.close()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar usuario: {err}")

@app.post("/usuarios", tags=["Usuarios"])
def crear_usuario(usuario: UsuarioCreate, current_user: TokenData = Depends(get_current_admin)):
    """Crear un nuevo usuario (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        # Verificar si el email ya existe
        cursor.execute("SELECT email FROM usuarios WHERE email = %s;", (usuario.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        hashed_password = get_password_hash(usuario.password)
        
        cursor.execute(
            "INSERT INTO usuarios (nombre, apellido, email, telefono, password, password_hash, rol) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (usuario.nombre, usuario.apellido, usuario.email, usuario.telefono, hashed_password, hashed_password, usuario.rol)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Usuario creado correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear usuario: {err}")

@app.put("/usuarios/{usuario_id}", tags=["Usuarios"])
def actualizar_usuario(usuario_id: int, usuario: UsuarioUpdate, current_user: TokenData = Depends(get_current_admin)):
    """Actualizar un usuario existente (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        # Verificar si existe
        cursor.execute("SELECT id FROM usuarios WHERE id = %s;", (usuario_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Construir query dinámico
        updates = []
        values = []
        if usuario.nombre: updates.append("nombre = %s"); values.append(usuario.nombre)
        if usuario.apellido: updates.append("apellido = %s"); values.append(usuario.apellido)
        if usuario.email: updates.append("email = %s"); values.append(usuario.email)
        if usuario.telefono: updates.append("telefono = %s"); values.append(usuario.telefono)
        if usuario.rol: updates.append("rol = %s"); values.append(usuario.rol)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo para actualizar")
        
        values.append(usuario_id)
        query = f"UPDATE usuarios SET {', '.join(updates)} WHERE id = %s;"
        cursor.execute(query, tuple(values))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Usuario {usuario_id} actualizado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {err}")

@app.delete("/usuarios/{usuario_id}", tags=["Usuarios"])
def eliminar_usuario(usuario_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Eliminar un usuario (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM usuarios WHERE id = %s;", (usuario_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        cursor.execute("DELETE FROM usuarios WHERE id = %s;", (usuario_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Usuario {usuario_id} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {err}")

# ========================================
# 👩‍💼 CRUD DE EMPLEADOS
# ========================================

@app.get("/empleados", tags=["Empleados"])
def obtener_empleados():
    """Obtener todos los empleados"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, email, telefono, especialidad, fecha_registro FROM empleados ORDER BY nombre;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"empleados": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar empleados: {err}")

@app.get("/empleados/{empleado_id}", tags=["Empleados"])
def obtener_empleado(empleado_id: int):
    """Obtener un empleado por ID"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, email, telefono, especialidad, fecha_registro FROM empleados WHERE id = %s;", (empleado_id,))
        empleado = cursor.fetchone()
        conexion.close()
        if not empleado:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        return empleado
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar empleado: {err}")

@app.post("/empleados", tags=["Empleados"])
def crear_empleado(empleado: EmpleadoCreate, current_user: TokenData = Depends(get_current_admin)):
    """Crear un nuevo empleado (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        # Verificar si el email ya existe
        cursor.execute("SELECT email FROM empleados WHERE email = %s;", (empleado.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        hashed_password = get_password_hash(empleado.password)
        
        cursor.execute(
            "INSERT INTO empleados (nombre, email, telefono, especialidad, password_hash) VALUES (%s, %s, %s, %s, %s);",
            (empleado.nombre, empleado.email, empleado.telefono, empleado.especialidad, hashed_password)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Empleado creado correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear empleado: {err}")

@app.put("/empleados/{empleado_id}", tags=["Empleados"])
def actualizar_empleado(empleado_id: int, empleado: EmpleadoUpdate, current_user: TokenData = Depends(get_current_admin)):
    """Actualizar un empleado existente (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        # Verificar si existe
        cursor.execute("SELECT id FROM empleados WHERE id = %s;", (empleado_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        # Construir query dinámico
        updates = []
        values = []
        if empleado.nombre: updates.append("nombre = %s"); values.append(empleado.nombre)
        if empleado.email: updates.append("email = %s"); values.append(empleado.email)
        if empleado.telefono: updates.append("telefono = %s"); values.append(empleado.telefono)
        if empleado.especialidad: updates.append("especialidad = %s"); values.append(empleado.especialidad)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo para actualizar")
        
        values.append(empleado_id)
        query = f"UPDATE empleados SET {', '.join(updates)} WHERE id = %s;"
        cursor.execute(query, tuple(values))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Empleado {empleado_id} actualizado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al actualizar empleado: {err}")

@app.delete("/empleados/{empleado_id}", tags=["Empleados"])
def eliminar_empleado(empleado_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Eliminar un empleado (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM empleados WHERE id = %s;", (empleado_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        cursor.execute("DELETE FROM empleados WHERE id = %s;", (empleado_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Empleado {empleado_id} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar empleado: {err}")

# ========================================
# 💅 CRUD DE SERVICIOS
# ========================================

@app.get("/servicios", tags=["Servicios"])
def obtener_servicios():
    """Obtener todos los servicios"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM servicios ORDER BY nombre;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"servicios": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar servicios: {err}")

@app.get("/servicios/{servicio_id}", tags=["Servicios"])
def obtener_servicio(servicio_id: int):
    """Obtener un servicio por ID"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM servicios WHERE id = %s;", (servicio_id,))
        servicio = cursor.fetchone()
        conexion.close()
        if not servicio:
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        return servicio
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar servicio: {err}")

@app.post("/servicios", tags=["Servicios"])
def crear_servicio(servicio: ServicioCreate, current_user: TokenData = Depends(get_current_admin)):
    """Crear un nuevo servicio (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute(
            "INSERT INTO servicios (nombre, descripcion, precio, duracion_min, imagen) VALUES (%s, %s, %s, %s, %s);",
            (servicio.nombre, servicio.descripcion, servicio.precio, servicio.duracion_min, servicio.imagen)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Servicio creado correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear servicio: {err}")

@app.put("/servicios/{servicio_id}", tags=["Servicios"])
def actualizar_servicio(servicio_id: int, servicio: ServicioUpdate, current_user: TokenData = Depends(get_current_admin)):
    """Actualizar un servicio existente (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        # Verificar si existe
        cursor.execute("SELECT id FROM servicios WHERE id = %s;", (servicio_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
        # Construir query dinámico
        updates = []
        values = []
        if servicio.nombre: updates.append("nombre = %s"); values.append(servicio.nombre)
        if servicio.descripcion: updates.append("descripcion = %s"); values.append(servicio.descripcion)
        if servicio.precio is not None: updates.append("precio = %s"); values.append(servicio.precio)
        if servicio.duracion_min: updates.append("duracion_min = %s"); values.append(servicio.duracion_min)
        if servicio.imagen: updates.append("imagen = %s"); values.append(servicio.imagen)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo para actualizar")
        
        values.append(servicio_id)
        query = f"UPDATE servicios SET {', '.join(updates)} WHERE id = %s;"
        cursor.execute(query, tuple(values))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Servicio {servicio_id} actualizado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al actualizar servicio: {err}")

@app.delete("/servicios/{servicio_id}", tags=["Servicios"])
def eliminar_servicio(servicio_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Eliminar un servicio (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM servicios WHERE id = %s;", (servicio_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
        cursor.execute("DELETE FROM servicios WHERE id = %s;", (servicio_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Servicio {servicio_id} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar servicio: {err}")

# ========================================
# 📅 CRUD DE RESERVAS
# ========================================

@app.get("/reservas", tags=["Reservas"])
def obtener_reservas(current_user: TokenData = Depends(get_current_user)):
    """Obtener todas las reservas"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.*, 
                   u.nombre as usuario_nombre, u.email as usuario_email,
                   s.nombre as servicio_nombre, s.precio as servicio_precio,
                   e.nombre as empleado_nombre
            FROM reservas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            LEFT JOIN servicios s ON r.servicio_id = s.id
            LEFT JOIN empleados e ON r.empleado_id = e.id
            ORDER BY r.fecha DESC, r.hora DESC;
        """)
        resultados = cursor.fetchall()
        conexion.close()
        return {"reservas": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar reservas: {err}")

@app.get("/reservas/{reserva_id}", tags=["Reservas"])
def obtener_reserva(reserva_id: int, current_user: TokenData = Depends(get_current_user)):
    """Obtener una reserva por ID"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.*, 
                   u.nombre as usuario_nombre, u.email as usuario_email, u.telefono as usuario_telefono,
                   s.nombre as servicio_nombre, s.descripcion as servicio_descripcion, s.precio as servicio_precio,
                   e.nombre as empleado_nombre, e.especialidad as empleado_especialidad
            FROM reservas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            LEFT JOIN servicios s ON r.servicio_id = s.id
            LEFT JOIN empleados e ON r.empleado_id = e.id
            WHERE r.id = %s;
        """, (reserva_id,))
        reserva = cursor.fetchone()
        conexion.close()
        if not reserva:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        return reserva
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar reserva: {err}")

@app.post("/reservas", tags=["Reservas"])
def crear_reserva(reserva: ReservaCreate, current_user: TokenData = Depends(get_current_user)):
    """Crear una nueva reserva"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute(
            "INSERT INTO reservas (usuario_id, servicio_id, empleado_id, fecha, hora, estado, notas) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (reserva.usuario_id, reserva.servicio_id, reserva.empleado_id, reserva.fecha, reserva.hora, reserva.estado, reserva.notas)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Reserva creada correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear reserva: {err}")

@app.put("/reservas/{reserva_id}", tags=["Reservas"])
def actualizar_reserva(reserva_id: int, reserva: ReservaUpdate, current_user: TokenData = Depends(get_current_user)):
    """Actualizar una reserva existente"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        # Verificar si existe
        cursor.execute("SELECT id FROM reservas WHERE id = %s;", (reserva_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
        # Construir query dinámico
        updates = []
        values = []
        if reserva.servicio_id: updates.append("servicio_id = %s"); values.append(reserva.servicio_id)
        if reserva.empleado_id: updates.append("empleado_id = %s"); values.append(reserva.empleado_id)
        if reserva.fecha: updates.append("fecha = %s"); values.append(reserva.fecha)
        if reserva.hora: updates.append("hora = %s"); values.append(reserva.hora)
        if reserva.estado: updates.append("estado = %s"); values.append(reserva.estado)
        if reserva.notas: updates.append("notas = %s"); values.append(reserva.notas)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo para actualizar")
        
        values.append(reserva_id)
        query = f"UPDATE reservas SET {', '.join(updates)} WHERE id = %s;"
        cursor.execute(query, tuple(values))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Reserva {reserva_id} actualizada correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al actualizar reserva: {err}")

@app.delete("/reservas/{reserva_id}", tags=["Reservas"])
def eliminar_reserva(reserva_id: int, current_user: TokenData = Depends(get_current_user)):
    """Eliminar una reserva"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM reservas WHERE id = %s;", (reserva_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
        cursor.execute("DELETE FROM reservas WHERE id = %s;", (reserva_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Reserva {reserva_id} eliminada correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar reserva: {err}")

# ========================================
# 📧 CRUD DE CONTACTO
# ========================================

@app.get("/contacto", tags=["Contacto"])
def obtener_mensajes_contacto(current_user: TokenData = Depends(get_current_admin)):
    """Obtener todos los mensajes de contacto (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM contacto ORDER BY fecha DESC;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"mensajes": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar mensajes: {err}")

@app.get("/contacto/{mensaje_id}", tags=["Contacto"])
def obtener_mensaje_contacto(mensaje_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Obtener un mensaje de contacto por ID (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM contacto WHERE id = %s;", (mensaje_id,))
        mensaje = cursor.fetchone()
        conexion.close()
        if not mensaje:
            raise HTTPException(status_code=404, detail="Mensaje no encontrado")
        return mensaje
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar mensaje: {err}")

@app.post("/contacto", tags=["Contacto"])
def crear_mensaje_contacto(mensaje: ContactoCreate):
    """Crear un nuevo mensaje de contacto (público)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute(
            "INSERT INTO contacto (nombre, email, mensaje) VALUES (%s, %s, %s);",
            (mensaje.nombre, mensaje.email, mensaje.mensaje)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Mensaje enviado correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al enviar mensaje: {err}")

@app.delete("/contacto/{mensaje_id}", tags=["Contacto"])
def eliminar_mensaje_contacto(mensaje_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Eliminar un mensaje de contacto (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM contacto WHERE id = %s;", (mensaje_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Mensaje no encontrado")
        
        cursor.execute("DELETE FROM contacto WHERE id = %s;", (mensaje_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Mensaje {mensaje_id} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar mensaje: {err}")

# ========================================
# 📜 CRUD DE LOGS
# ========================================

@app.get("/logs", tags=["Logs"])
def obtener_logs(current_user: TokenData = Depends(get_current_admin)):
    """Obtener todos los logs del sistema (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM logs ORDER BY fecha DESC LIMIT 1000;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"logs": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar logs: {err}")

@app.get("/logs/{log_id}", tags=["Logs"])
def obtener_log(log_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Obtener un log por ID (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM logs WHERE id = %s;", (log_id,))
        log = cursor.fetchone()
        conexion.close()
        if not log:
            raise HTTPException(status_code=404, detail="Log no encontrado")
        return log
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar log: {err}")

@app.post("/logs", tags=["Logs"])
def crear_log(log: LogCreate, current_user: TokenData = Depends(get_current_user)):
    """Crear un nuevo log"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute(
            "INSERT INTO logs (usuario_email, accion) VALUES (%s, %s);",
            (log.usuario_email, log.accion)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Log creado correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear log: {err}")

@app.delete("/logs/{log_id}", tags=["Logs"])
def eliminar_log(log_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Eliminar un log (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM logs WHERE id = %s;", (log_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Log no encontrado")
        
        cursor.execute("DELETE FROM logs WHERE id = %s;", (log_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Log {log_id} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar log: {err}")

# ========================================
# 🔑 CRUD DE TOKENS DE RECUPERACIÓN
# ========================================

@app.get("/tokens-recuperacion", tags=["Tokens"])
def obtener_tokens_recuperacion(current_user: TokenData = Depends(get_current_admin)):
    """Obtener todos los tokens de recuperación (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tokens_recuperacion ORDER BY expiracion DESC;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"tokens": resultados, "total": len(resultados)}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar tokens: {err}")

@app.get("/tokens-recuperacion/{token_id}", tags=["Tokens"])
def obtener_token_recuperacion(token_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Obtener un token de recuperación por ID (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tokens_recuperacion WHERE id = %s;", (token_id,))
        token = cursor.fetchone()
        conexion.close()
        if not token:
            raise HTTPException(status_code=404, detail="Token no encontrado")
        return token
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar token: {err}")

@app.post("/tokens-recuperacion", tags=["Tokens"])
def crear_token_recuperacion(token_data: TokenRecuperacionCreate):
    """Crear un nuevo token de recuperación"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute(
            "INSERT INTO tokens_recuperacion (email, token, expiracion) VALUES (%s, %s, %s);",
            (token_data.email, token_data.token, token_data.expiracion)
        )
        conexion.commit()
        nuevo_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "Token de recuperación creado correctamente", "id": nuevo_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear token: {err}")

@app.delete("/tokens-recuperacion/{token_id}", tags=["Tokens"])
def eliminar_token_recuperacion(token_id: int, current_user: TokenData = Depends(get_current_admin)):
    """Eliminar un token de recuperación (solo admin)"""
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT id FROM tokens_recuperacion WHERE id = %s;", (token_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Token no encontrado")
        
        cursor.execute("DELETE FROM tokens_recuperacion WHERE id = %s;", (token_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"Token {token_id} eliminado correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar token: {err}")
