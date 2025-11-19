# main.py
from fastapi import FastAPI, HTTPException
from db_connection import conectar
import mysql.connector


# Inicializar la aplicación
app = FastAPI(
    title="Yeris API",
    description="API para gestionar usuarios en la base de datos Yeris",
    version="2.0.0"
)

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
@app.get("/")
def root():
    
    return {"message": "🚀 API Yeris en funcionamiento"}


# 📦 1️⃣ GET - Obtener todos los usuarios
@app.get("/usuarios")
def obtener_usuarios():
    try:
        conexion = conectar()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios;")
        resultados = cursor.fetchall()
        conexion.close()
        return {"usuarios": resultados}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error al consultar usuarios: {err}")


# 📦 2️⃣ GET - Obtener un usuario por ID
@app.get("/usuarios/{usuario_id}")
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
@app.post("/usuarios")
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
@app.put("/usuarios/{usuario_id}")
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
@app.delete("/usuarios/{usuario_id}")
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
@app.get("/tablas")
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
