# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from db_connection import conectar
import mysql.connector
from datetime import timedelta
from auth import (
    UserLogin, UserRegister, Token, ReservaCreate,
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_admin, TokenData,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Inicializar la aplicación
app = FastAPI(
    title="Yary Nails API",
    description="API para gestionar reservas, usuarios y servicios con autenticación",
    version="4.0.0",
    openapi_tags=[
        {"name": "Sistema", "description": "Información general del sistema"},
        {"name": "Auth", "description": "Endpoints de autenticación y autorización"},
        {"name": "Usuarios", "description": "Gestión de usuarios del sistema"},
        {"name": "Empleados", "description": "Gestión de empleados y especialidades"},
        {"name": "Servicios", "description": "Gestión de servicios ofrecidos"},
        {"name": "Reservas", "description": "Gestión de reservas y citas"},
        {"name": "Contacto", "description": "Mensajes de contacto del formulario"},
        {"name": "Logs", "description": "Registro de acciones del sistema"},
    ]
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica el dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lista negra de tokens (en producción usar Redis)
token_blacklist = set()

# 🟢 Verificar conexión al iniciar el servidor
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
            print(" -", t[0])
        conexion.close()
    else:
        print("❌ Error al conectar con la base de datos.")


# 🏠 Ruta raíz
@app.get("/", tags=["Sistema"])
def root():
    return {"message": "🚀 API Yary Nails en funcionamiento", "version": "4.0.0"}


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
            "INSERT INTO usuarios (nombre, apellido, email, password, password_hash, telefono, rol) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (user.nombre, user.apellido, user.email, hashed_password, hashed_password, user.telefono, user.rol)
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
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Iniciar sesión con OAuth2PasswordRequestForm"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        # Buscar usuario por email (username contiene el email)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s;", (form_data.username,))
        usuario = cursor.fetchone()
        
        if not usuario:
            conexion.close()
            raise HTTPException(
                status_code=401, 
                detail="Email o contraseña incorrectos"
            )
        
        # Verificar contraseña con Argon2
        if not verify_password(form_data.password, usuario['password']):
            conexion.close()
            raise HTTPException(
                status_code=401, 
                detail="Email o contraseña incorrectos"
            )
        
        conexion.close()
        
        # Crear token JWT
        access_token = create_access_token(
            data={"sub": usuario['email'], "rol": usuario['rol']},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Remover password antes de enviar
        usuario_data = {
            "id": usuario['id'],
            "nombre": usuario['nombre'],
            "apellido": usuario['apellido'],
            "email": usuario['email'],
            "telefono": usuario['telefono'],
            "rol": usuario['rol'],
            "fecha_registro": str(usuario.get('fecha_registro', ''))
        }
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": usuario_data
        }
        
    except HTTPException:
        raise
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {err}")
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {err}")


@app.post("/auth/logout", tags=["Auth"])
def logout(current_user: TokenData = Depends(get_current_user)):
    """Cerrar sesión (agregar token a lista negra)"""
    # En producción, agregar el token a Redis con TTL
    # Por ahora, solo confirmamos el logout
    return {"message": "Sesión cerrada exitosamente"}


@app.get("/auth/me", tags=["Auth"])
def get_me(current_user: TokenData = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        cursor.execute("SELECT id, nombre, apellido, email, telefono, rol, fecha_registro FROM usuarios WHERE email = %s;", (current_user.email,))
        usuario = cursor.fetchone()
        conexion.close()
        
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Convertir fecha_registro a string si existe
        if usuario.get('fecha_registro'):
            usuario['fecha_registro'] = str(usuario['fecha_registro'])
        
        return usuario
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error: {err}")


# 📦 1️⃣ GET - Obtener todos los usuarios (solo admin)
@app.get("/usuarios", tags=["Usuarios"])
def obtener_usuarios(current_user: TokenData = Depends(get_current_admin)):
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT id, nombre, email, telefono, rol FROM usuarios;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"usuarios": resultados}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar usuarios: {err}")


# 📦 2️⃣ GET - Obtener un usuario por ID
@app.get("/usuarios/{usuario_id}", tags=["Usuarios"])
def obtener_usuario(usuario_id: int):
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE id = %s;", (usuario_id,))
        usuario = cursor.fetchone()
        conexion.close()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar usuario: {err}")


# ➕ 3️⃣ POST - Crear un nuevo usuario
@app.post("/usuarios", tags=["Usuarios"])
def crear_usuario(nombre: str, correo: str):
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        cursor.execute(
            "INSERT INTO usuarios (nombre, correo) VALUES (%s, %s);",
            (nombre, correo)
        )
        conexion.commit()
        conexion.close()
        return {"mensaje": f"✅ Usuario '{nombre}' creado correctamente."}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear usuario: {err}")


# ✏️ 4️⃣ PUT - Actualizar un usuario existente
@app.put("/usuarios/{usuario_id}", tags=["Usuarios"])
def actualizar_usuario(usuario_id: int, nombre: str = None, correo: str = None):
    try:
        conexion = conectar()
        cursor = conexion.cursor()

        # Verificar si el usuario existe
        cursor.execute("SELECT * FROM usuarios WHERE id = %s;", (usuario_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Actualizar datos
        if nombre and correo:
            cursor.execute(
                "UPDATE usuarios SET nombre = %s, correo = %s WHERE id = %s;",
                (nombre, correo, usuario_id)
            )
        elif nombre:
            cursor.execute(
                "UPDATE usuarios SET nombre = %s WHERE id = %s;",
                (nombre, usuario_id)
            )
        elif correo:
            cursor.execute(
                "UPDATE usuarios SET correo = %s WHERE id = %s;",
                (correo, usuario_id)
            )
        else:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo para actualizar")

        conexion.commit()
        conexion.close()
        return {"mensaje": f"✏️ Usuario con ID {usuario_id} actualizado correctamente."}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {err}")


# ❌ 5️⃣ DELETE - Eliminar un usuario
@app.delete("/usuarios/{usuario_id}", tags=["Usuarios"])
def eliminar_usuario(usuario_id: int):
    try:
        conexion = conectar()
        cursor = conexion.cursor()

        # Verificar si el usuario existe
        cursor.execute("SELECT * FROM usuarios WHERE id = %s;", (usuario_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        cursor.execute("DELETE FROM usuarios WHERE id = %s;", (usuario_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"🗑️ Usuario con ID {usuario_id} eliminado correctamente."}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {err}")


# 🧩 6️⃣ GET - Mostrar tablas disponibles
@app.get("/tablas", tags=["Sistema"])
def listar_tablas():
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
# 📅 ENDPOINTS PARA RESERVAS
# ========================================

# GET - Obtener todas las reservas con nombres de servicio y empleado
@app.get("/reservas", tags=["Reservas"])
def obtener_reservas():
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        
        # JOIN con servicios, empleados y usuarios para obtener toda la información
        query = """
        SELECT 
            r.*,
            s.nombre as servicio_nombre,
            s.precio as servicio_precio,
            e.nombre as empleado_nombre,
            u.nombre as usuario_nombre
        FROM reservas r
        LEFT JOIN servicios s ON r.id_servicio = s.id
        LEFT JOIN empleados e ON r.id_empleado = e.id
        LEFT JOIN usuarios u ON r.id_usuario = u.id
        ORDER BY r.fecha DESC, r.hora DESC
        """
        
        cursor.execute(query)
        resultados = cursor.fetchall()
        
        # Convertir fechas a string
        for r in resultados:
            if r.get('fecha'):
                r['fecha'] = str(r['fecha'])
        
        conexion.close()
        return {"reservas": resultados}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar reservas: {err}")


# GET - Obtener una reserva por ID
@app.get("/reservas/{reserva_id}")
def obtener_reserva(reserva_id: int):
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM reservas WHERE id = %s;", (reserva_id,))
        reserva = cursor.fetchone()
        conexion.close()
        if not reserva:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        return reserva
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar reserva: {err}")


# POST - Crear una nueva reserva
@app.post("/reservas", tags=["Reservas"])
def crear_reserva(reserva: ReservaCreate):
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        cursor.execute(
            """INSERT INTO reservas (id_usuario, id_servicio, id_empleado, fecha, hora, estado, notas) 
               VALUES (%s, %s, %s, %s, %s, %s, %s);""",
            (reserva.id_usuario, reserva.id_servicio, reserva.id_empleado, 
             reserva.fecha, reserva.hora, reserva.estado, reserva.notas)
        )
        conexion.commit()
        reserva_id = cursor.lastrowid
        conexion.close()
        return {"mensaje": "✅ Reserva creada correctamente", "id": reserva_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al crear reserva: {err}")


# PUT - Actualizar una reserva
@app.put("/reservas/{reserva_id}", tags=["Reservas"])
def actualizar_reserva(
    reserva_id: int,
    fecha: str = None,
    hora: str = None,
    estado: str = None,
    notas: str = None
):
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        # Verificar si existe
        cursor.execute("SELECT * FROM reservas WHERE id = %s;", (reserva_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
        # Construir query dinámico
        updates = []
        values = []
        if fecha: updates.append("fecha = %s"); values.append(fecha)
        if hora: updates.append("hora = %s"); values.append(hora)
        if estado: updates.append("estado = %s"); values.append(estado)
        if notas is not None: updates.append("notas = %s"); values.append(notas)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo para actualizar")
        
        values.append(reserva_id)
        query = f"UPDATE reservas SET {', '.join(updates)} WHERE id = %s;"
        cursor.execute(query, tuple(values))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"✏️ Reserva {reserva_id} actualizada correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al actualizar reserva: {err}")


# DELETE - Eliminar una reserva
@app.delete("/reservas/{reserva_id}", tags=["Reservas"])
def eliminar_reserva(reserva_id: int):
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        cursor.execute("SELECT * FROM reservas WHERE id = %s;", (reserva_id,))
        if cursor.fetchone() is None:
            conexion.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        
        cursor.execute("DELETE FROM reservas WHERE id = %s;", (reserva_id,))
        conexion.commit()
        conexion.close()
        return {"mensaje": f"🗑️ Reserva {reserva_id} eliminada correctamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al eliminar reserva: {err}")


# ========================================
# 💅 ENDPOINTS PARA SERVICIOS
# ========================================

# GET - Obtener todos los servicios
@app.get("/servicios", tags=["Servicios"])
def obtener_servicios():
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM servicios ORDER BY nombre;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"servicios": resultados}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar servicios: {err}")


# GET - Obtener un servicio por ID
@app.get("/servicios/{servicio_id}", tags=["Servicios"])
def obtener_servicio(servicio_id: int):
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


# ========================================
# 👥 ENDPOINTS PARA EMPLEADOS
# ========================================

# GET - Obtener todos los empleados
@app.get("/empleados", tags=["Empleados"])
def obtener_empleados():
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM empleados ORDER BY nombre;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"empleados": resultados}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar empleados: {err}")


# GET - Obtener un empleado por ID
@app.get("/empleados/{empleado_id}", tags=["Empleados"])
def obtener_empleado(empleado_id: int):
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM empleados WHERE id = %s;", (empleado_id,))
        empleado = cursor.fetchone()
        conexion.close()
        if not empleado:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        return empleado
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al buscar empleado: {err}")


