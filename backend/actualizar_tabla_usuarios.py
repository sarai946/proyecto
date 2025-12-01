import mysql.connector
from mysql.connector import Error

# Credenciales de Railway
config = {
    'host': 'shinkansen.proxy.rlwy.net',
    'port': 26272,
    'user': 'root',
    'password': 'kNOiEIMPMCwYqNCWewLGrdCICLfwEjSB',
    'database': 'railway'
}

try:
    print("🔄 Conectando a Railway...")
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor()
    
    print("✅ Conexión exitosa!\n")
    
    # Verificar estructura de tabla usuarios
    cursor.execute("DESCRIBE usuarios;")
    campos = cursor.fetchall()
    
    print("📊 Estructura actual de la tabla 'usuarios':")
    for campo in campos:
        print(f"   • {campo[0]} - {campo[1]}")
    
    print("\n🔧 Agregando campos necesarios para autenticación...")
    
    # Agregar campo password si no existe
    try:
        cursor.execute("ALTER TABLE usuarios ADD COLUMN password VARCHAR(255) AFTER email;")
        print("   ✓ Campo 'password' agregado")
    except Error as e:
        if "Duplicate column name" in str(e):
            print("   ℹ Campo 'password' ya existe")
        else:
            print(f"   ⚠ Error al agregar 'password': {e}")
    
    # Agregar campo rol si no existe
    try:
        cursor.execute("ALTER TABLE usuarios ADD COLUMN rol ENUM('admin', 'cliente') DEFAULT 'cliente' AFTER password;")
        print("   ✓ Campo 'rol' agregado")
    except Error as e:
        if "Duplicate column name" in str(e):
            print("   ℹ Campo 'rol' ya existe")
        else:
            print(f"   ⚠ Error al agregar 'rol': {e}")
    
    connection.commit()
    
    # Verificar estructura actualizada
    cursor.execute("DESCRIBE usuarios;")
    campos = cursor.fetchall()
    
    print("\n📊 Estructura actualizada de la tabla 'usuarios':")
    for campo in campos:
        print(f"   • {campo[0]} - {campo[1]}")
    
    print("\n✅ ¡Tabla de usuarios actualizada correctamente!")
    
except Error as e:
    print(f"❌ Error: {e}")
finally:
    if connection and connection.is_connected():
        cursor.close()
        connection.close()
        print("\n🔌 Conexión cerrada")
