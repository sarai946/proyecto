"""
Script para insertar usuarios predefinidos en la base de datos Railway MySQL
Ejecutar desde: backend/api/
Comando: python insertar_usuarios.py
"""

import mysql.connector
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

# Cargar variables de entorno
load_dotenv()

# Configurar bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conectar a Railway MySQL
def conectar_db():
    try:
        conexion = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            port=int(os.getenv('MYSQL_PORT')),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE')
        )
        print("✅ Conexión exitosa a Railway MySQL")
        return conexion
    except Exception as e:
        print(f"❌ Error al conectar: {e}")
        return None

# Hash de la contraseña
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Insertar usuarios
def insertar_usuarios():
    conexion = conectar_db()
    if not conexion:
        return
    
    cursor = conexion.cursor()
    
    # Contraseña para todos los usuarios: "Pass123!"
    # Hash generado con bcrypt
    password_hash = "$2b$12$3BBbZ2NkJ1Ac.EYYnShZIuNi.W9eTNxpvFZDSO4cZILWa94NztZBG"
    
    usuarios = [
        # ADMINISTRADOR
        ('Admin', 'Principal', 'admin@yarynails.com', '+1 (555) 100-0001', password_hash, 'admin'),
        
        # EMPLEADAS
        ('María', 'García', 'maria@yarynails.com', '+1 (555) 200-0001', password_hash, 'empleado'),
        ('Ana', 'Rodríguez', 'ana@yarynails.com', '+1 (555) 200-0002', password_hash, 'empleado'),
        ('Laura', 'Martínez', 'laura@yarynails.com', '+1 (555) 200-0003', password_hash, 'empleado'),
        
        # CLIENTES
        ('Sofia', 'López', 'sofia@example.com', '+1 (555) 300-0001', password_hash, 'cliente'),
        ('Isabella', 'Hernández', 'isabella@example.com', '+1 (555) 300-0002', password_hash, 'cliente'),
        ('Valentina', 'González', 'valentina@example.com', '+1 (555) 300-0003', password_hash, 'cliente'),
        ('Camila', 'Pérez', 'camila@example.com', '+1 (555) 300-0004', password_hash, 'cliente'),
        ('Emma', 'Sánchez', 'emma@example.com', '+1 (555) 300-0005', password_hash, 'cliente'),
    ]
    
    query = """
    INSERT INTO usuarios (nombre, apellido, email, telefono, password, password_hash, rol, fecha_registro)
    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
    ON DUPLICATE KEY UPDATE email = email
    """
    
    try:
        for usuario in usuarios:
            # usuario = (nombre, apellido, email, telefono, password_hash, rol)
            # Necesitamos: nombre, apellido, email, telefono, password, password_hash, rol
            usuario_data = (
                usuario[0],  # nombre
                usuario[1],  # apellido
                usuario[2],  # email
                usuario[3],  # telefono
                usuario[4],  # password
                usuario[4],  # password_hash (mismo que password)
                usuario[5],  # rol
            )
            cursor.execute(query, usuario_data)
            print(f"✅ Usuario insertado: {usuario[2]} (Rol: {usuario[5]})")
        
        conexion.commit()
        
        # Insertar empleadas en la tabla empleados
        query_empleados = """
        INSERT INTO empleados (nombre, email, telefono, especialidad, password_hash)
        SELECT CONCAT(u.nombre, ' ', u.apellido), u.email, u.telefono, 'Especialista en Uñas', u.password_hash
        FROM usuarios u
        WHERE u.rol = 'empleado'
        ON DUPLICATE KEY UPDATE empleados.email = empleados.email
        """
        cursor.execute(query_empleados)
        conexion.commit()
        print("\n✅ Empleadas insertadas en tabla empleados")
        
        # Verificar usuarios insertados
        cursor.execute("SELECT id, nombre, apellido, email, rol FROM usuarios ORDER BY rol, nombre")
        usuarios_db = cursor.fetchall()
        
        print("\n📋 Usuarios en la base de datos:")
        print("-" * 80)
        print(f"{'ID':<5} {'Nombre':<20} {'Email':<30} {'Rol':<15}")
        print("-" * 80)
        for user in usuarios_db:
            print(f"{user[0]:<5} {user[1]} {user[2]:<20} {user[3]:<30} {user[4]:<15}")
        
        print("\n" + "=" * 80)
        print("🎉 USUARIOS PREDEFINIDOS INSERTADOS EXITOSAMENTE")
        print("=" * 80)
        print("\n📝 CREDENCIALES DE ACCESO:")
        print("-" * 80)
        print("ADMIN:")
        print("  Email: admin@yarynails.com")
        print("  Contraseña: Password123!")
        print("\nEMPLEADAS:")
        print("  maria@yarynails.com")
        print("  ana@yarynails.com")
        print("  laura@yarynails.com")
        print("  Contraseña: Password123!")
        print("\nCLIENTES:")
        print("  sofia@example.com")
        print("  isabella@example.com")
        print("  valentina@example.com")
        print("  camila@example.com")
        print("  emma@example.com")
        print("  Contraseña: Password123!")
        print("-" * 80)
        
    except mysql.connector.Error as e:
        print(f"❌ Error al insertar usuarios: {e}")
        conexion.rollback()
    finally:
        cursor.close()
        conexion.close()

if __name__ == "__main__":
    print("🚀 Iniciando inserción de usuarios predefinidos...")
    print("=" * 80)
    insertar_usuarios()
