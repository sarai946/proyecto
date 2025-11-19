
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, g, abort, make_response
import sqlite3, os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'messages.db')
# Path al frontend estático (carpeta `fronend` en la raíz del proyecto).
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', '..', 'fronend'))

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    db.execute('''CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    db.commit()

    db.execute('''CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT,
        servicio TEXT,
        fecha TEXT,
        hora TEXT,
        estado TEXT DEFAULT 'activa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    db.commit()


# Configuramos Flask para servir los archivos estáticos del frontend
# original (index.html, style.css, assets/...). Esto permite acceder a la
# versión de frontend que está en la carpeta `fronend` del proyecto.
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='', template_folder='templates')
app.config['SECRET_KEY'] = 'dev-secret'

# Inicializar la BD de forma compatible con distintas versiones de Flask
with app.app_context():
    init_db()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    # Servir el index estático del frontend original (carpeta `fronend`).
    return app.send_static_file('index.html')


# Interceptar peticiones a imágenes y mapear .png faltantes a .jpg sin tocar el frontend.
@app.route('/assets/img/<path:filename>')
def assets_img(filename):
    img_dir = os.path.join(FRONTEND_DIR, 'assets', 'img')
    requested = os.path.join(img_dir, filename)
    if os.path.exists(requested):
        return send_from_directory(img_dir, filename)

    base, ext = os.path.splitext(filename)
    # si piden .png, probar con .jpg
    if ext.lower() == '.png':
        alt = base + '.jpg'
        if os.path.exists(os.path.join(img_dir, alt)):
            return send_from_directory(img_dir, alt)
        # caso con nombre ligeramente distinto en el ZIP (por ejemplo 'ima_3.jpg')
        if base == 'img_3' and os.path.exists(os.path.join(img_dir, 'ima_3.jpg')):
            return send_from_directory(img_dir, 'ima_3.jpg')

    abort(404)

# Rutas para las páginas de servicios
@app.route('/servicio-facial-glow.html')
def servicio_facial_glow():
    return app.send_static_file('servicio-facial-glow.html')

@app.route('/servicio-keratina.html')
def servicio_keratina():
    return app.send_static_file('servicio-keratina.html')

@app.route('/servicio-acrilicas.html')
def servicio_acrilicas():
    return app.send_static_file('servicio-acrilicas.html')

@app.route('/servicio-pedicure.html')
def servicio_pedicure():
    return app.send_static_file('servicio-pedicure.html')

@app.route('/reservas.html')
def reservas():
    return app.send_static_file('reservas.html')

# Guardar reserva desde el formulario (POST)
@app.route('/reservar', methods=['POST'])
def reservar():
    nombre = request.form.get('nombre', '').strip()
    email = request.form.get('email', '').strip()
    telefono = request.form.get('telefono', '').strip()
    servicio = request.form.get('servicio', '').strip()
    fecha = request.form.get('fecha', '').strip()
    hora = request.form.get('hora', '').strip()
    if not nombre or not email or not servicio or not fecha or not hora:
        return "Faltan campos obligatorios.", 400
    db = get_db()
    db.execute('INSERT INTO reservas (nombre, email, telefono, servicio, fecha, hora) VALUES (?, ?, ?, ?, ?, ?)',
               (nombre, email, telefono, servicio, fecha, hora))
    db.commit()
    return redirect(url_for('index') + '#reservas')

@app.route('/contact', methods=['POST'])
def contact():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    service = request.form.get('service', '').strip()
    message = request.form.get('message', '').strip()

    if not name or not email or not message:
        return "Faltan campos obligatorios (name, email, message).", 400

    db = get_db()
    db.execute('INSERT INTO messages (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)',
               (name, email, phone, service, message))
    db.commit()

    return redirect(url_for('index') + '#contact')


# Ruta para descargar el PDF de requerimientos (está en static/docs)
@app.route('/docs/<path:filename>')
def docs(filename):
    return send_from_directory(os.path.join(app.static_folder, 'docs'), filename, as_attachment=True)

# Ruta administrativa para listar mensajes
# Protegida por una clave simple en query param: ?key=YOUR_ADMIN_KEY
ADMIN_KEY = 'adminpass'  # Cambia esto antes de desplegar

@app.route('/admin/messages')
def admin_messages():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(401)
    db = get_db()
    cur = db.execute('SELECT * FROM messages ORDER BY created_at DESC')
    rows = cur.fetchall()
    html = ['<h1>Mensajes recibidos</h1>', '<a href="/">Volver al sitio</a>', '<table border="1" cellpadding="6"><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Servicio</th><th>Mensaje</th><th>Fecha</th></tr>']
    for r in rows:
        html.append(f"<tr><td>{r['id']}</td><td>{r['name']}</td><td>{r['email']}</td><td>{r['phone']}</td><td>{r['service']}</td><td>{r['message']}</td><td>{r['created_at']}</td></tr>")
    html.append('</table>')
    return '\n'.join(html)

StopIteration# Ruta admin para ver reservas
@app.route('/admin/reservas')
def admin_reservas():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(401)
    db = get_db()
    cur = db.execute('SELECT * FROM reservas ORDER BY created_at DESC')
    rows = cur.fetchall()
    html = ['<h1>Reservas realizadas</h1>', '<a href="/">Volver al sitio</a>', '<p><a href="/admin/export/reservas.csv?key=%s">Exportar CSV de reservas</a></p>' % key, '<table border="1" cellpadding="6"><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acción</th></tr>']
    for r in rows:
        cancelar_url = url_for('admin_cancelar_reserva', id=r['id'], key=key)
        borrar_url = url_for('admin_delete_reserva', id=r['id'], key=key)
        html.append(f"<tr><td>{r['id']}</td><td>{r['nombre']}</td><td>{r['email']}</td><td>{r['telefono']}</td><td>{r['servicio']}</td><td>{r['fecha']}</td><td>{r['hora']}</td><td>{r['estado']}</td><td><a href='{cancelar_url}' onclick='return confirm(\'¿Seguro que quieres cancelar?\')'>Cancelar</a> | <a href='{borrar_url}' onclick='return confirm(\'¿Seguro que quieres BORRAR permanentemente esta reserva?\')'>Borrar</a></td></tr>")
    html.append('</table>')
    return '\n'.join(html)


@app.route('/admin/delete_reserva/<int:id>')
def admin_delete_reserva(id):
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(401)
    db = get_db()
    db.execute('DELETE FROM reservas WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('admin_reservas', key=key))


# POST endpoints for AJAX actions (cancelar/borrar) to be used by admin panel
@app.route('/admin/cancelar_reserva/<int:id>', methods=['POST'])
def admin_cancelar_reserva_post(id):
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        return ("", 401)
    db = get_db()
    db.execute('UPDATE reservas SET estado = "cancelada" WHERE id = ?', (id,))
    db.commit()
    return ('', 204)


@app.route('/admin/delete_reserva/<int:id>', methods=['POST'])
def admin_delete_reserva_post(id):
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        return ("", 401)
    db = get_db()
    db.execute('DELETE FROM reservas WHERE id = ?', (id,))
    db.commit()
    return ('', 204)


@app.route('/admin/export/messages.csv')
def export_messages_csv():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(401)
    db = get_db()
    cur = db.execute('SELECT * FROM messages ORDER BY created_at DESC')
    rows = cur.fetchall()
    import csv, io
    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(['id','name','email','phone','service','message','created_at'])
    for r in rows:
        writer.writerow([r['id'], r['name'], r['email'], r['phone'], r['service'], r['message'], r['created_at']])
    output = si.getvalue()
    resp = make_response(output)
    resp.headers['Content-Disposition'] = 'attachment; filename=messages.csv'
    resp.headers['Content-Type'] = 'text/csv; charset=utf-8'
    return resp


@app.route('/admin/export/reservas.csv')
def export_reservas_csv():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(401)
    db = get_db()
    cur = db.execute('SELECT * FROM reservas ORDER BY created_at DESC')
    rows = cur.fetchall()
    import csv, io
    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(['id','nombre','email','telefono','servicio','fecha','hora','estado','created_at'])
    for r in rows:
        writer.writerow([r['id'], r['nombre'], r['email'], r['telefono'], r['servicio'], r['fecha'], r['hora'], r['estado'], r['created_at']])
    output = si.getvalue()
    resp = make_response(output)
    resp.headers['Content-Disposition'] = 'attachment; filename=reservas.csv'
    resp.headers['Content-Type'] = 'text/csv; charset=utf-8'
    return resp

# Ruta admin para cancelar reserva
@app.route('/admin/cancelar_reserva/<int:id>')
def admin_cancelar_reserva(id):
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(401)
    db = get_db()
    db.execute('UPDATE reservas SET estado = "cancelada" WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('admin_reservas', key=key))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
