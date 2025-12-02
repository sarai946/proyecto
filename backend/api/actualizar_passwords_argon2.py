# actualizar_passwords_argon2.py
"""
Script para actualizar las contraseñas de bcrypt a Argon2
"""

import mysql.connector
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Configuración de Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Conexión a la base de datos
def conectar():
    try:
        conexion = mysql.connector.connect(
            host="shinkansen.proxy.rlwy.net",
            port=26272,
            user="root",
            password="kNOiEIMPMCwYqNCWewLGrdCICLfwEjSB",
            database="railway"
        )
        return conexion
    except mysql.connector.Error as err:
        print(f"❌ Error de conexión: {err}")
        return None

def actualizar_passwords():
    """
    Actualiza todas las contraseñas de los usuarios a Argon2
    """
    conexion = conectar()
    if not conexion:
        return
    
    cursor = conexion.cursor(dictionary=True)
    
    try:
        # La contraseña original es "Password123!" para todos los usuarios
        password_original = "Password123!"
        
        # Generar nuevo hash con Argon2
        nuevo_hash = pwd_context.hash(password_original)
        
        print("🔄 Actualizando contraseñas a Argon2...")
        print(f"📝 Nuevo hash Argon2: {nuevo_hash[:50]}...")
        
        # Obtener todos los usuarios
        cursor.execute("SELECT id, email FROM usuarios;")
        usuarios = cursor.fetchall()
        
        print(f"\n📊 Total de usuarios a actualizar: {len(usuarios)}")
        
        # Actualizar cada usuario
        actualizados = 0
        for usuario in usuarios:
            cursor.execute(
                "UPDATE usuarios SET password = %s, password_hash = %s WHERE id = %s;",
                (nuevo_hash, nuevo_hash, usuario['id'])
            )
            print(f"✅ Actualizado: {usuario['email']}")
            actualizados += 1
        
        conexion.commit()
        
        print(f"\n🎉 ¡Proceso completado!")
        print(f"✅ {actualizados} contraseñas actualizadas a Argon2")
        print(f"\n🔑 Contraseña para todos los usuarios: {password_original}")
        
        # Verificar una contraseña
        cursor.execute("SELECT email, password FROM usuarios LIMIT 1;")
        usuario_test = cursor.fetchone()
        if usuario_test:
            es_valida = pwd_context.verify(password_original, usuario_test['password'])
            print(f"\n🧪 Verificación de hash: {'✅ CORRECTA' if es_valida else '❌ INCORRECTA'}")
        
    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
        conexion.rollback()
    finally:
        cursor.close()
        conexion.close()

if __name__ == "__main__":
    print("=" * 80)
    print("🔐 ACTUALIZACIÓN DE CONTRASEÑAS A ARGON2")
    print("=" * 80)
    actualizar_passwords()
    print("=" * 80)
