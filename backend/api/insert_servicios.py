# insert_servicios.py - Insertar servicios iniciales
import mysql.connector
from db_connection import conectar

servicios = [
    {
        "nombre": "Manicure Básico",
        "descripcion": "Manicure tradicional con limado, cutícula y esmaltado básico",
        "duracion_min": 45,
        "precio": 150.00,
        "imagen": "manicure-basico.jpg"
    },
    {
        "nombre": "Manicure Spa",
        "descripcion": "Manicure completo con exfoliación, masaje y esmaltado premium",
        "duracion_min": 60,
        "precio": 250.00,
        "imagen": "manicure-spa.jpg"
    },
    {
        "nombre": "Manicure Permanente (Gel)",
        "descripcion": "Esmaltado en gel de larga duración (2-3 semanas)",
        "duracion_min": 60,
        "precio": 300.00,
        "imagen": "gel-manicure.jpg"
    },
    {
        "nombre": "Uñas Acrílicas",
        "descripcion": "Extensión de uñas con acrílico, diseño básico incluido",
        "duracion_min": 90,
        "precio": 450.00,
        "imagen": "acrilicas.jpg"
    },
    {
        "nombre": "Uñas de Gel",
        "descripcion": "Extensión de uñas con gel, más natural y flexible",
        "duracion_min": 90,
        "precio": 500.00,
        "imagen": "gel-extension.jpg"
    },
    {
        "nombre": "Pedicure Básico",
        "descripcion": "Pedicure con limado, cutícula, exfoliación y esmaltado",
        "duracion_min": 60,
        "precio": 200.00,
        "imagen": "pedicure-basico.jpg"
    },
    {
        "nombre": "Pedicure Spa",
        "descripcion": "Pedicure completo con mascarilla, masaje y parafina",
        "duracion_min": 75,
        "precio": 350.00,
        "imagen": "pedicure-spa.jpg"
    },
    {
        "nombre": "Diseño de Uñas (Simple)",
        "descripcion": "Diseño artístico simple en uñas (líneas, puntos, francés)",
        "duracion_min": 30,
        "precio": 100.00,
        "imagen": "diseno-simple.jpg"
    },
    {
        "nombre": "Diseño de Uñas (Complejo)",
        "descripcion": "Diseño artístico elaborado con técnicas avanzadas",
        "duracion_min": 60,
        "precio": 250.00,
        "imagen": "diseno-complejo.jpg"
    },
    {
        "nombre": "Relleno de Uñas",
        "descripcion": "Relleno de acrílico o gel en uñas existentes",
        "duracion_min": 60,
        "precio": 300.00,
        "imagen": "relleno.jpg"
    },
    {
        "nombre": "Retiro de Uñas Artificiales",
        "descripcion": "Retiro seguro de uñas acrílicas o de gel",
        "duracion_min": 30,
        "precio": 150.00,
        "imagen": "retiro.jpg"
    },
    {
        "nombre": "Kapping (Fortalecimiento)",
        "descripcion": "Capa protectora de gel para fortalecer uñas naturales",
        "duracion_min": 45,
        "precio": 200.00,
        "imagen": "kapping.jpg"
    }
]

def insertar_servicios():
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        
        # Verificar si ya hay servicios
        cursor.execute("SELECT COUNT(*) as total FROM servicios")
        resultado = cursor.fetchone()
        
        if resultado[0] > 0:
            print(f"⚠️  Ya existen {resultado[0]} servicios en la base de datos.")
            respuesta = input("¿Deseas eliminarlos e insertar los nuevos? (s/n): ")
            if respuesta.lower() != 's':
                print("❌ Operación cancelada")
                conexion.close()
                return
            
            cursor.execute("DELETE FROM servicios")
            print("🗑️  Servicios anteriores eliminados")
        
        # Insertar nuevos servicios
        query = """
            INSERT INTO servicios (nombre, descripcion, duracion_min, precio, imagen) 
            VALUES (%s, %s, %s, %s, %s)
        """
        
        for servicio in servicios:
            cursor.execute(query, (
                servicio["nombre"],
                servicio["descripcion"],
                servicio["duracion_min"],
                servicio["precio"],
                servicio["imagen"]
            ))
        
        conexion.commit()
        
        print(f"\n✅ {len(servicios)} servicios insertados correctamente:")
        print("=" * 80)
        
        cursor.execute("SELECT id, nombre, precio, duracion_min FROM servicios ORDER BY precio")
        for servicio in cursor.fetchall():
            print(f"  {servicio[0]:2d}. {servicio[1]:35s} ${servicio[2]:7.2f} ({servicio[3]} min)")
        
        print("=" * 80)
        conexion.close()
        print("\n🎉 Base de datos actualizada exitosamente!")
        
    except mysql.connector.Error as err:
        print(f"❌ Error al insertar servicios: {err}")

if __name__ == "__main__":
    print("🔧 Insertando servicios iniciales en Yary Nails...")
    print("-" * 70)
    insertar_servicios()
