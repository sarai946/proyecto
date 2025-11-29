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

# Leer el archivo SQL
sql_file = r'C:\Users\joesm\OneDrive\Documentos\dumps\Dump20251125.sql'

try:
    print("🔄 Conectando a Railway...")
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor()
    
    print("📂 Leyendo archivo SQL...")
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    print("📤 Importando base de datos...")
    # Dividir por comandos SQL
    commands = sql_script.split(';')
    
    for i, command in enumerate(commands):
        command = command.strip()
        if command:
            try:
                cursor.execute(command)
                if (i + 1) % 10 == 0:
                    print(f"   Procesados {i + 1} comandos...")
            except Error as e:
                # Ignorar errores menores como comentarios
                if "syntax" not in str(e).lower():
                    print(f"⚠️  Advertencia: {e}")
    
    connection.commit()
    print("✅ ¡Base de datos importada exitosamente a Railway!")
    
except Error as e:
    print(f"❌ Error: {e}")
finally:
    if connection and connection.is_connected():
        cursor.close()
        connection.close()
        print("🔌 Conexión cerrada")
