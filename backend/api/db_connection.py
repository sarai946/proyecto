import mysql.connector
from mysql.connector import Error

def conectar():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",          # si tu MySQL tiene pass, colócala aquí
            database="yary_nails", # CAMBIA por tu base de datos
            port=3306
        )

        if connection.is_connected():
            print("🔌 Conexión exitosa a MySQL")
            return connection

    except Error as e:
        print(f"❌ Error al conectar a MySQL: {e}")
        return None
