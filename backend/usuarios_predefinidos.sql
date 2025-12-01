-- ==================================================
-- SCRIPT DE USUARIOS PREDEFINIDOS
-- Yary Nails Studio - Railway MySQL Database
-- ==================================================

USE railway;

-- Verificar que la tabla usuarios tenga las columnas necesarias
-- (Este script asume que ya ejecutaste actualizar_tabla_usuarios.py)

-- Insertar usuarios predefinidos para pruebas
-- NOTA: Las contraseñas están hasheadas con bcrypt
-- Contraseña para todos: "Password123!"

-- 1. ADMINISTRADOR
INSERT INTO usuarios (nombre, apellido, email, telefono, password, rol, fecha_registro) 
VALUES (
  'Admin',
  'Principal',
  'admin@yarynails.com',
  '+1 (555) 100-0001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'admin',
  NOW()
) ON DUPLICATE KEY UPDATE email=email;

-- 2. EMPLEADAS (Especialistas en Uñas)
INSERT INTO usuarios (nombre, apellido, email, telefono, password, rol, fecha_registro) 
VALUES 
(
  'María',
  'García',
  'maria@yarynails.com',
  '+1 (555) 200-0001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'empleado',
  NOW()
),
(
  'Ana',
  'Rodríguez',
  'ana@yarynails.com',
  '+1 (555) 200-0002',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'empleado',
  NOW()
),
(
  'Laura',
  'Martínez',
  'laura@yarynails.com',
  '+1 (555) 200-0003',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'empleado',
  NOW()
)
ON DUPLICATE KEY UPDATE email=email;

-- 3. CLIENTES DE PRUEBA
INSERT INTO usuarios (nombre, apellido, email, telefono, password, rol, fecha_registro) 
VALUES 
(
  'Sofia',
  'López',
  'sofia@example.com',
  '+1 (555) 300-0001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'cliente',
  NOW()
),
(
  'Isabella',
  'Hernández',
  'isabella@example.com',
  '+1 (555) 300-0002',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'cliente',
  NOW()
),
(
  'Valentina',
  'González',
  'valentina@example.com',
  '+1 (555) 300-0003',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'cliente',
  NOW()
),
(
  'Camila',
  'Pérez',
  'camila@example.com',
  '+1 (555) 300-0004',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'cliente',
  NOW()
),
(
  'Emma',
  'Sánchez',
  'emma@example.com',
  '+1 (555) 300-0005',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYI7t0o7zC4RTJK',  -- Password123!
  'cliente',
  NOW()
)
ON DUPLICATE KEY UPDATE email=email;

-- Verificar los usuarios insertados
SELECT 
  id,
  nombre,
  apellido,
  email,
  rol,
  fecha_registro
FROM usuarios
ORDER BY rol, nombre;

-- ==================================================
-- CREDENCIALES DE ACCESO PARA PRUEBAS
-- ==================================================
/*
ADMINISTRADOR:
  Email: admin@yarynails.com
  Contraseña: Password123!

EMPLEADAS:
  Email: maria@yarynails.com
  Email: ana@yarynails.com
  Email: laura@yarynails.com
  Contraseña: Password123! (para todas)

CLIENTES:
  Email: sofia@example.com
  Email: isabella@example.com
  Email: valentina@example.com
  Email: camila@example.com
  Email: emma@example.com
  Contraseña: Password123! (para todos)
*/

-- ==================================================
-- INSERTAR EMPLEADOS EN LA TABLA EMPLEADOS
-- ==================================================

-- Primero, obtener los IDs de los usuarios empleados
-- Luego insertarlos en la tabla empleados

INSERT INTO empleados (nombre, apellido, email, telefono, especialidad, disponibilidad)
SELECT 
  nombre,
  apellido,
  email,
  telefono,
  'Especialista en Uñas',
  'Lunes a Sábado 9:00-18:00'
FROM usuarios
WHERE rol = 'empleado'
ON DUPLICATE KEY UPDATE email=email;

-- Verificar empleados
SELECT * FROM empleados;
