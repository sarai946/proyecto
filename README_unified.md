# Yary Nails — Unified Project

Estructura generada:
- /frontend                 -> Contenido del frontend (extraído de 'yary_complete_project (2).zip')
- /backend/original_backup  -> Contenido original del backend (extraído de 'Yary_Nails_Backend.zip')
- /backend/server.js        -> Servidor Express que sirve el frontend y prueba conexión a PostgreSQL
- /backend/.env.example     -> Ejemplo de variables de entorno
- package.json              -> Script start -> `node backend/server.js`

## Pasos para ejecutar localmente

1. Copia `.env.example` a `backend/.env` y edita `DATABASE_URL` con tus credenciales de PostgreSQL.
   Ejemplo: `DATABASE_URL=postgresql://postgres:12345@localhost:5432/yary_nails`
2. Abre una terminal en la raíz del proyecto y corre:
   ```
   npm install
   npm start
   ```
3. El servidor servirá el frontend en `http://localhost:4000` por defecto.

## Notas
- Si tu backend original ya contiene un servidor Node/Express, deberás revisar `backend/original_backup` y migrar rutas o lógica al `backend/server.js` o importarlas manualmente.
- Este scaffold usa Sequelize para conectarse a PostgreSQL (no crea modelos automáticamente).
- Si necesitas que copie o integre rutas concretas del backend original dentro del nuevo `server.js`, dímelo y lo hago (requiere revisar los archivos del backend original).

Buen trabajo — el ZIP unificado está listo para descargar.
