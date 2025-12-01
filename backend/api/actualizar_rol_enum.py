"""
Script para actualizar el ENUM de rol en la tabla usuarios
"""

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST'),
        port=int(os.getenv('MYSQL_PORT')),
        user=os.getenv('MYSQL_USER'),
        password=os.getenv('MYSQL_PASSWORD'),
        database=os.getenv('MYSQL_DATABASE')
    )
    
    cursor = conn.cursor()
    
    # Actualizar ENUM para incluir 'empleado'
    query = "ALTER TABLE usuarios MODIFY COLUMN rol ENUM('admin', 'cliente', 'empleado') DEFAULT 'cliente'"
    cursor.execute(query)
    conn.commit()
    
    print("✅ Columna 'rol' actualizada exitosamente")
    print("   Valores permitidos: admin, cliente, empleado")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
