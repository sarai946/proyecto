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
    
    print("✅ Conexión exitosa a Railway!\n")
    
    # Ver todas las tablas
    cursor.execute("SHOW TABLES;")
    tablas = cursor.fetchall()
    
    print(f"📊 Tablas encontradas ({len(tablas)}):")
    for tabla in tablas:
        print(f"   • {tabla[0]}")
        
        # Contar registros en cada tabla
        cursor.execute(f"SELECT COUNT(*) FROM {tabla[0]};")
        count = cursor.fetchone()[0]
        print(f"     └─ {count} registros")
    
    print("\n✅ Tu base de datos está correctamente hosteada en Railway!")
    
except Error as e:
    print(f"❌ Error al conectar: {e}")
finally:
    if connection and connection.is_connected():
        cursor.close()
        connection.close()
