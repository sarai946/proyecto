import mysql.connector
from mysql.connector import Error

def crear_conexion():
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="tu_contraseña",   # cámbialo por la tuya
            database="nombre_de_tu_bd"  # cámbialo por tu base
        )

        if conexion.is_connected():
            print("✅ Conexión exitosa a MySQL")
            return conexion
    except Error as e:
        print(f"❌ Error al conectar: {e}")
        return None
