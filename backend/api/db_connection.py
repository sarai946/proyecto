import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def conectar():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "yary_nails"),
            port=int(os.getenv("MYSQL_PORT", "3306"))
        )

        if connection.is_connected():
            print("🔌 Conexión exitosa a MySQL")
            return connection

    except Error as e:
        print(f"❌ Error al conectar a MySQL: {e}")
        return None
