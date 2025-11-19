import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",         # tu servidor MySQL (XAMPP/MAMP/WAMP)
        user="root",              # tu usuario
        password="",              # tu contraseña (vacía si usas XAMPP)
        database="yary_nails"     # nombre exacto de tu BD
    )
