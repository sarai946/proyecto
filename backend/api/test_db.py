from db_connection import get_connection

conn = get_connection()

if conn:
    print("✅ Conexión exitosa a MySQL!")
else:
    print("❌ No se pudo conectar")
