from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASSWORD', 'password')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'itsm')

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

app = Flask(__name__)
CORS(app)


def fetch_all(sql, params=None):
    params = params or {}
    with engine.connect() as conn:
        result = conn.execute(text(sql), params)
        rows = []
        for r in result:
            mapping = getattr(r, "_mapping", None)
            if mapping is not None:
                rows.append(dict(mapping))
            else:
                try:
                    rows.append(dict(r))
                except Exception:
                    rows.append(r)
        return rows


def execute(sql, params=None):
    params = params or {}
    with engine.begin() as conn:
        result = conn.execute(text(sql), params)
        try:
            return result.lastrowid
        except Exception:
            return None


def ensure_password_column():
    try:
        cols = fetch_all("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash'", {'db': DB_NAME})
        if not cols:
            # Add nullable password_hash column for storing password hashes
            try:
                execute('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL')
            except Exception:
                pass
    except Exception:
        # If information_schema query fails, ignore — column may not exist and will error on use
        pass


# ensure password column exists before auth endpoints run
ensure_password_column()


@app.route('/api/ping')
def ping():
    return jsonify({'status': 'ok', 'message': 'pong'})


"""
Assets endpoints
"""


@app.route('/api/assets', methods=['GET'])
def get_assets():
    rows = fetch_all('SELECT * FROM assets ORDER BY id DESC LIMIT 500')
    return jsonify(rows)


@app.route('/api/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    rows = fetch_all('SELECT * FROM assets WHERE id = :id', {'id': asset_id})
    if not rows:
        return make_response(jsonify({'error': 'not found'}), 404)
    return jsonify(rows[0])


@app.route('/api/assets', methods=['POST'])
def create_asset():
    data = request.get_json() or {}
    sql = '''INSERT INTO assets (name, serial, category, status, location, purchase_date)
             VALUES (:name, :serial, :category, :status, :location, :purchase_date)'''
    params = {
        'name': data.get('name'),
        'serial': data.get('serial'),
        'category': data.get('category'),
        'status': data.get('status', 'available'),
        'location': data.get('location'),
        'purchase_date': data.get('purchase_date')
    }
    new_id = execute(sql, params)
    return jsonify({'id': new_id}), 201


@app.route('/api/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    data = request.get_json() or {}
    sql = '''UPDATE assets SET name=:name, serial=:serial, category=:category, status=:status, location=:location, purchase_date=:purchase_date
             WHERE id=:id'''
    params = {
        'id': asset_id,
        'name': data.get('name'),
        'serial': data.get('serial'),
        'category': data.get('category'),
        'status': data.get('status'),
        'location': data.get('location'),
        'purchase_date': data.get('purchase_date')
    }
    execute(sql, params)
    return jsonify({'ok': True})


@app.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    execute('DELETE FROM assets WHERE id = :id', {'id': asset_id})
    return jsonify({'ok': True})


"""
Users, Departments, Assignments, Issues
"""


@app.route('/api/departments', methods=['GET'])
def list_departments():
    return jsonify(fetch_all('SELECT * FROM departments ORDER BY id'))


@app.route('/api/users', methods=['GET'])
def list_users():
    return jsonify(fetch_all('SELECT * FROM users ORDER BY id'))


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    sql = 'INSERT INTO users (name, email, role, department_id) VALUES (:name, :email, :role, :dept)'
    params = {'name': data.get('name'), 'email': data.get('email'), 'role': data.get('role'), 'dept': data.get('department_id')}
    new_id = execute(sql, params)
    return jsonify({'id': new_id}), 201


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json() or {}
    # allow updating name, email, role, department_id, and password
    fields = []
    params = {'id': user_id}
    if 'name' in data:
        fields.append('name = :name')
        params['name'] = data.get('name')
    if 'email' in data:
        fields.append('email = :email')
        params['email'] = data.get('email')
    if 'role' in data:
        fields.append('role = :role')
        params['role'] = data.get('role')
    if 'department_id' in data:
        fields.append('department_id = :dept')
        params['dept'] = data.get('department_id')
    if 'password' in data and data.get('password'):
        pw_hash = generate_password_hash(data.get('password'))
        fields.append('password_hash = :ph')
        params['ph'] = pw_hash

    if not fields:
        return make_response(jsonify({'error': 'no fields to update'}), 400)

    sql = 'UPDATE users SET ' + ', '.join(fields) + ' WHERE id = :id'
    execute(sql, params)
    return jsonify({'ok': True})


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # delete user and cascade will handle related rows per schema
    execute('DELETE FROM users WHERE id = :id', {'id': user_id})
    return jsonify({'ok': True})


@app.route('/api/assignments', methods=['GET'])
def list_assignments():
    return jsonify(fetch_all('SELECT * FROM assignments ORDER BY id DESC'))


@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    data = request.get_json() or {}
    sql = '''INSERT INTO assignments (asset_id, user_id, assigned_at, notes)
             VALUES (:asset_id, :user_id, :assigned_at, :notes)'''
    params = {
        'asset_id': data.get('asset_id'),
        'user_id': data.get('user_id'),
        'assigned_at': data.get('assigned_at', datetime.utcnow().isoformat()),
        'notes': data.get('notes')
    }
    new_id = execute(sql, params)
    # mark asset as assigned
    execute('UPDATE assets SET status = :status WHERE id = :id', {'status': 'assigned', 'id': data.get('asset_id')})
    return jsonify({'id': new_id}), 201


@app.route('/api/assignments/history', methods=['GET'])
def assignments_history():
    # return full assignment history including returned_at
    rows = fetch_all('SELECT * FROM assignments ORDER BY assigned_at DESC LIMIT 1000')
    return jsonify(rows)


@app.route('/api/assignments/<int:assignment_id>/return', methods=['POST'])
def return_assignment(assignment_id):
    data = request.get_json() or {}
    performed_by = data.get('performedBy')

    # find assignment to get asset_id
    rows = fetch_all('SELECT * FROM assignments WHERE id = :id', {'id': assignment_id})
    if not rows:
        return make_response(jsonify({'error': 'assignment not found'}), 404)

    assignment = rows[0]
    asset_id = assignment.get('asset_id')

    # mark returned_at and optionally add note
    returned_at = datetime.utcnow().isoformat()
    execute('UPDATE assignments SET returned_at = :rt WHERE id = :id', {'rt': returned_at, 'id': assignment_id})

    # update asset status back to available
    if asset_id:
        execute('UPDATE assets SET status = :status WHERE id = :id', {'status': 'available', 'id': asset_id})

    return jsonify({'ok': True, 'returned_at': returned_at, 'performed_by': performed_by})


@app.route('/api/issues', methods=['GET'])
def list_issues():
    return jsonify(fetch_all('SELECT * FROM issues ORDER BY id DESC'))


@app.route('/api/issues', methods=['POST'])
def create_issue():
    data = request.get_json() or {}
    sql = '''INSERT INTO issues (asset_id, user_id, title, description, status, created_at)
             VALUES (:asset_id, :user_id, :title, :description, :status, :created_at)'''
    params = {
        'asset_id': data.get('asset_id'),
        'user_id': data.get('user_id'),
        'title': data.get('title'),
        'description': data.get('description'),
        'status': data.get('status', 'open'),
        'created_at': data.get('created_at', datetime.utcnow().isoformat())
    }
    new_id = execute(sql, params)
    return jsonify({'id': new_id}), 201


@app.route('/api/auth/activate', methods=['POST'])
def activate_account():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return make_response(jsonify({'success': False, 'message': 'email and password required'}), 400)

    rows = fetch_all('SELECT * FROM users WHERE email = :email', {'email': email})
    if not rows:
        return make_response(jsonify({'success': False, 'message': 'user not found'}), 404)

    user = rows[0]
    if user.get('password_hash'):
        return make_response(jsonify({'success': False, 'message': 'account already activated'}), 400)

    pw_hash = generate_password_hash(password)
    execute('UPDATE users SET password_hash = :ph WHERE id = :id', {'ph': pw_hash, 'id': user['id']})
    return jsonify({'success': True, 'message': 'account activated'})


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return make_response(jsonify({'success': False, 'message': 'email and password required'}), 400)

    rows = fetch_all('SELECT * FROM users WHERE email = :email', {'email': email})
    if not rows:
        return make_response(jsonify({'success': False, 'message': 'invalid credentials'}), 401)

    user = rows[0]
    ph = user.get('password_hash')
    if not ph:
        return make_response(jsonify({'success': False, 'message': 'account not activated'}), 403)

    if not check_password_hash(ph, password):
        return make_response(jsonify({'success': False, 'message': 'invalid credentials'}), 401)

    user.pop('password_hash', None)
    return jsonify({'success': True, 'message': 'login successful', 'user': user})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
