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

# Allow local frontend dev server by default; override via CORS_ORIGINS env
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:8080').split(',')
CORS(
    app,
    resources={r"/api/*": {"origins": [o.strip() for o in cors_origins if o.strip()]}},
    supports_credentials=True,
)


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


def serialize_row(row):
    """Convert SQLAlchemy Row to dict"""
    mapping = getattr(row, "_mapping", None)
    if mapping is not None:
        return dict(mapping)
    try:
        return dict(row)
    except Exception:
        return row


def execute(sql, params=None):
    params = params or {}
    try:
        with engine.begin() as conn:
            result = conn.execute(text(sql), params)
            try:
                last_id = result.lastrowid
                print(f"[execute] Success: SQL executed, lastrowid={last_id}")
                return last_id
            except Exception as e:
                print(f"[execute] No lastrowid available (might be OK for non-INSERT): {e}")
                return None
    except Exception as e:
        print(f"[execute] Error executing SQL: {str(e)}")
        print(f"[execute] SQL: {sql}")
        print(f"[execute] Params: {params}")
        raise  # Re-raise so caller can handle


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


@app.route('/api/debug/connection', methods=['GET'])
def debug_connection():
    """Debug endpoint: show Flask's database connection details."""
    try:
        # Show configured connection details (redact password)
        config = {
            'DB_HOST': DB_HOST,
            'DB_PORT': DB_PORT,
            'DB_USER': DB_USER,
            'DB_NAME': DB_NAME,
            'DATABASE_URL': DATABASE_URL.replace(DB_PASS, '****')
        }
        
        # Try a basic query to confirm connection works
        test_query = fetch_all('SELECT DATABASE() as current_db, COUNT(*) as user_count FROM users')
        
        # Also get raw count from users table
        raw_users = fetch_all('SELECT id, name, email, role, status FROM users ORDER BY id')
        
        return jsonify({
            'config': config,
            'connection_test': test_query,
            'raw_users_count': len(raw_users),
            'raw_users_sample': raw_users[:5] if raw_users else [],
            'status': 'ok'
        })
    except Exception as e:
        return make_response(jsonify({
            'config': {
                'DB_HOST': DB_HOST,
                'DB_PORT': DB_PORT,
                'DB_USER': DB_USER,
                'DB_NAME': DB_NAME,
            },
            'error': str(e),
            'status': 'connection_failed'
        }), 500)


"""
Auth endpoints
"""


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return make_response(jsonify({'error': 'email and password required'}), 400)
    
    rows = fetch_all('SELECT * FROM users WHERE email = :email', {'email': email})
    
    if not rows:
        return make_response(jsonify({'error': 'user not found'}), 404)
    
    user = rows[0]
    
    # Check if user is inactive
    if user.get('status') == 'inactive':
        return make_response(jsonify({'error': 'account deactivated'}), 403)
    
    # Check if user has a password hash (first login check)
    password_hash = user.get('password_hash')
    if not password_hash:
        return make_response(jsonify({'error': 'please complete account activation first'}), 403)
    
    # Verify password
    if not check_password_hash(password_hash, password):
        return make_response(jsonify({'error': 'invalid password'}), 401)
    
    # Return user without password_hash
    user_response = {k: v for k, v in user.items() if k != 'password_hash'}
    return jsonify({'success': True, 'user': user_response})


@app.route('/api/auth/activate', methods=['POST'])
def activate_account():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return make_response(jsonify({'error': 'email and password required'}), 400)
    
    rows = fetch_all('SELECT * FROM users WHERE email = :email', {'email': email})
    
    if not rows:
        return make_response(jsonify({'error': 'user not found'}), 404)
    
    user = rows[0]
    user_id = user.get('id')
    
    # Check if already activated
    if user.get('password_hash'):
        return make_response(jsonify({'error': 'account already activated'}), 400)
    
    # Hash the password and set it
    password_hash = generate_password_hash(password)
    execute('UPDATE users SET password_hash = :ph WHERE id = :id', {'ph': password_hash, 'id': user_id})
    
    return jsonify({'success': True, 'message': 'account activated successfully'})


"""
Assets endpoints
"""


@app.route('/api/assets', methods=['GET'])
def get_assets():
    rows = fetch_all('SELECT * FROM assets ORDER BY id DESC LIMIT 500')
    # Ensure IDs are strings for consistency with frontend
    result = []
    for row in rows:
        if isinstance(row, dict):
            row['id'] = str(row.get('id'))
        result.append(row)
    return jsonify(result)


@app.route('/api/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    rows = fetch_all('SELECT * FROM assets WHERE id = :id', {'id': asset_id})
    if not rows:
        return make_response(jsonify({'error': 'not found'}), 404)
    return jsonify(rows[0])


@app.route('/api/assets', methods=['POST'])
def create_asset():
    data = request.get_json() or {}
    try:
        # Convert empty strings to None for date fields
        purchase_date = data.get('purchaseDate') or None
        warranty_expiry = data.get('warrantyExpiry') or None
        
        sql = '''INSERT INTO assets (name, serialNumber, type, status, department, purchaseDate, warrantyExpiry, description)
                 VALUES (:name, :serialNumber, :type, :status, :department, :purchaseDate, :warrantyExpiry, :description)'''
        params = {
            'name': data.get('name'),
            'serialNumber': data.get('serialNumber'),
            'type': data.get('type'),
            'status': data.get('status', 'available'),
            'department': data.get('department'),
            'purchaseDate': purchase_date,
            'warrantyExpiry': warranty_expiry,
            'description': data.get('description')
        }
        print(f"[create_asset] params: {params}")
        new_id = execute(sql, params)
        if not new_id:
            return make_response(jsonify({'error': 'Failed to create asset', 'detail': 'Insert returned no ID'}), 400)
        print(f"[create_asset] created asset with ID: {new_id}")
        return jsonify({'id': str(new_id), **params}), 201
    except Exception as e:
        print(f"[create_asset] error: {str(e)}")
        return make_response(jsonify({'error': 'Failed to create asset', 'detail': str(e)}), 400)


@app.route('/api/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    data = request.get_json() or {}
    sql = '''UPDATE assets SET name=:name, serialNumber=:serialNumber, type=:type, status=:status, department=:department, purchaseDate=:purchaseDate, warrantyExpiry=:warrantyExpiry, description=:description
             WHERE id=:id'''
    params = {
        'id': asset_id,
        'name': data.get('name'),
        'serialNumber': data.get('serialNumber'),
        'type': data.get('type'),
        'status': data.get('status'),
        'department': data.get('department'),
        'purchaseDate': data.get('purchaseDate'),
        'warrantyExpiry': data.get('warrantyExpiry'),
        'description': data.get('description')
    }
    execute(sql, params)
    rows = fetch_all('SELECT * FROM assets WHERE id = :id', {'id': asset_id})
    if rows:
        row = rows[0]
        if isinstance(row, dict):
            row['id'] = str(row.get('id'))
        return jsonify(row)
    return jsonify({})


@app.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    execute('DELETE FROM assets WHERE id = :id', {'id': asset_id})
    return jsonify({'ok': True})


@app.route('/api/assets/expiry/all', methods=['GET'])
def get_expiry_alerts():
    """
    Fetch assets with expiry alerts (expired, critical, or warning status)
    Only returns assets with <= 60 days remaining or already expired
    """
    from datetime import datetime, timedelta, date
    
    rows = fetch_all('SELECT * FROM assets ORDER BY warrantyExpiry ASC')
    today = datetime.now().date()
    result = []
    
    for row in rows:
        if not row.get('warrantyExpiry'):
            continue
        
        try:
            warranty_expiry_value = row['warrantyExpiry']
            if isinstance(warranty_expiry_value, str):
                warranty_date = datetime.strptime(warranty_expiry_value, '%Y-%m-%d').date()
            elif isinstance(warranty_expiry_value, date):
                warranty_date = warranty_expiry_value
            else:
                print(f"[get_expiry_alerts] Invalid warrantyExpiry type for asset {row.get('id')}: {type(warranty_expiry_value)}")
                continue
            
            days_left = (warranty_date - today).days
            
            # Determine status and only include if <= 60 days or expired
            if days_left < 0:
                status = 'expired'
            elif days_left <= 30:
                status = 'critical'
            elif days_left <= 60:
                status = 'warning'
            else:
                continue  # Skip assets with > 60 days remaining
            
            result.append({
                'id': str(row.get('id')),
                'name': row.get('name'),
                'type': row.get('type'),
                'serialNumber': row.get('serialNumber'),
                'warranty': warranty_date.strftime('%Y-%m-%d'),  # Normalize to string
                'days_left': days_left,
                'status': status
            })
        except Exception as e:
            print(f"[get_expiry_alerts] Error processing row {row.get('id')}: {e}")
            continue
    
    return jsonify(result)


"""
Users, Departments, Assignments, Issues
"""


@app.route('/api/departments', methods=['GET'])
def list_departments():
    depts = fetch_all('SELECT * FROM departments ORDER BY id')
    # Ensure IDs are strings for consistency
    result = []
    for dept in depts:
        if isinstance(dept, dict):
            dept['id'] = str(dept.get('id'))
        result.append(dept)
    return jsonify(result)


@app.route('/api/users', methods=['GET'])
def list_users():
    # Return users with department name for frontend convenience
    users = fetch_all('''SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, d.name as department
                         FROM users u
                         LEFT JOIN departments d ON u.department_id = d.id
                         ORDER BY u.id''')
    # Ensure IDs are strings for consistency
    result = []
    for user in users:
        if isinstance(user, dict):
            user['id'] = str(user.get('id'))
        result.append(user)
    print(f"[list_users] Returning {len(result)} users")
    if result:
        print(f"[list_users] Sample: {result[0]}")
    return jsonify(result)


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')

    # Accept either department_id (int) or department (name)
    dept_id = data.get('department_id')
    dept_name = data.get('department')
    if not dept_id and dept_name:
        # look up department id by name
        rows = fetch_all('SELECT id FROM departments WHERE name = :name LIMIT 1', {'name': dept_name})
        if rows:
            dept_id = rows[0].get('id')
        else:
            dept_id = None

    sql = 'INSERT INTO users (name, email, role, department_id) VALUES (:name, :email, :role, :dept)'
    params = {'name': name, 'email': email, 'role': role, 'dept': dept_id}
    try:
        # Log create attempt
        print(f"[create_user] inserting user: email={email}, name={name}, role={role}, dept_id={dept_id}")
        new_id = execute(sql, params)
        print(f"[create_user] insert returned id: {new_id}")
    except Exception as e:
        # handle common errors like duplicate email or FK constraint
        err_msg = str(e)
        print(f"[create_user] error: {err_msg}")
        return make_response(jsonify({'error': 'Failed to create user', 'detail': err_msg}), 400)

    # Return created user as object (including department name) for frontend
    try:
        created = fetch_all('''SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, d.name as department
                               FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.email = :email LIMIT 1''', {'email': email})
        if created:
            user = created[0]
            if isinstance(user, dict):
                user['id'] = str(user.get('id'))
            return jsonify(user), 201
    except Exception:
        pass

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
    # Accept either department_id or department (name)
    if 'department_id' in data:
        fields.append('department_id = :dept')
        params['dept'] = data.get('department_id')
    elif 'department' in data and data.get('department'):
        # resolve department name to id
        rows = fetch_all('SELECT id FROM departments WHERE name = :name LIMIT 1', {'name': data.get('department')})
        if rows:
            fields.append('department_id = :dept')
            params['dept'] = rows[0].get('id')
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
    rows = fetch_all('SELECT * FROM assignments ORDER BY id DESC')
    # Convert snake_case from DB to camelCase for frontend
    result = []
    for row in rows:
        result.append({
            'id': str(row.get('id')),
            'assetId': str(row.get('asset_id')),
            'userId': str(row.get('user_id')),
            'assignedDate': str(row.get('assigned_at')).split()[0] if row.get('assigned_at') else '',  # Just the date part
            'returnDate': str(row.get('returned_at')).split()[0] if row.get('returned_at') else None,  # Just the date part
            'assignedBy': str(row.get('assigned_by')) if row.get('assigned_by') else 'system',
            'notes': row.get('notes', '')
        })
    return jsonify(result)


@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    data = request.get_json() or {}
    # Accept both camelCase (from frontend) and snake_case (from API clients)
    asset_id = data.get('assetId') or data.get('asset_id')
    user_id = data.get('userId') or data.get('user_id')
    assigned_by = data.get('assignedBy') or data.get('assigned_by')
    assigned_at = data.get('assignedAt') or data.get('assigned_at') or datetime.utcnow().isoformat()
    notes = data.get('notes', '')
    
    sql = '''INSERT INTO assignments (asset_id, user_id, assigned_by, assigned_at, notes)
             VALUES (:asset_id, :user_id, :assigned_by, :assigned_at, :notes)'''
    params = {
        'asset_id': asset_id,
        'user_id': user_id,
        'assigned_by': assigned_by,
        'assigned_at': assigned_at,
        'notes': notes
    }
    new_id = execute(sql, params)
    # mark asset as assigned
    execute('UPDATE assets SET status = :status WHERE id = :id', {'status': 'assigned', 'id': asset_id})
    return jsonify({'id': str(new_id), 'assetId': str(asset_id), 'userId': str(user_id), 'assignedBy': str(assigned_by) if assigned_by else 'system', 'assignedDate': str(assigned_at).split()[0], 'returnDate': None, 'notes': notes}), 201


@app.route('/api/assignments/history', methods=['GET'])
def assignments_history():
    # return full assignment history including returned_at
    rows = fetch_all('SELECT * FROM assignments ORDER BY assigned_at DESC LIMIT 1000')
    # Convert snake_case from DB to camelCase for frontend
    result = []
    for row in rows:
        result.append({
            'id': str(row.get('id')),
            'assetId': str(row.get('asset_id')),
            'userId': str(row.get('user_id')),
            'assignedDate': str(row.get('assigned_at')).split()[0] if row.get('assigned_at') else '',
            'returnDate': str(row.get('returned_at')).split()[0] if row.get('returned_at') else None,
            'action': 'returned' if row.get('returned_at') else 'assigned',
            'performedBy': str(row.get('assigned_by')) if row.get('assigned_by') else 'system',
            'timestamp': str(row.get('assigned_at'))  # Use assigned_at as timestamp
        })
    return jsonify(result)


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
    rows = fetch_all('SELECT * FROM issues ORDER BY id DESC')
    # Convert snake_case from DB to camelCase for frontend
    result = []
    for row in rows:
        result.append({
            'id': str(row.get('id')),
            'assetId': str(row.get('asset_id')) if row.get('asset_id') else '',
            'userId': str(row.get('user_id')) if row.get('user_id') else '',
            'description': row.get('description', ''),
            'priority': row.get('priority', 'medium'),
            'status': row.get('status', 'pending'),
            'adminRemarks': row.get('admin_remarks', ''),
            'createdAt': str(row.get('created_at')).split()[0] if row.get('created_at') else '',
            'updatedAt': str(row.get('updated_at')).split()[0] if row.get('updated_at') else ''
        })
    return jsonify(result)


@app.route('/api/debug/users_raw', methods=['GET'])
def debug_users_raw():
    """Return raw users table rows (for debugging persistence)."""
    try:
        rows = fetch_all('SELECT * FROM users ORDER BY id')
        
        # Also get the formatted version to compare
        formatted = fetch_all('''SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, d.name as department
                                 FROM users u
                                 LEFT JOIN departments d ON u.department_id = d.id
                                 ORDER BY u.id''')
        
        print(f"[debug_users_raw] Total users: {len(rows)}")
        if len(rows) > 0:
            print(f"[debug_users_raw] First user (raw): {rows[0]}")
            print(f"[debug_users_raw] First user (formatted): {formatted[0] if formatted else 'N/A'}")
        
        return jsonify({
            'count': len(rows),
            'raw_rows': rows,
            'formatted_rows': formatted
        })
    except Exception as e:
        return make_response(jsonify({'error': 'failed to read users', 'detail': str(e)}), 500)


@app.route('/api/issues', methods=['POST'])
def create_issue():
    data = request.get_json() or {}
    # Accept both camelCase (from frontend) and snake_case
    asset_id = data.get('assetId') or data.get('asset_id')
    user_id = data.get('userId') or data.get('user_id')
    description = data.get('description', '')
    priority = data.get('priority', 'medium')
    status = data.get('status', 'pending')
    created_at = data.get('createdAt') or data.get('created_at') or datetime.utcnow().isoformat()
    
    sql = '''INSERT INTO issues (asset_id, user_id, description, priority, status, created_at, updated_at)
             VALUES (:asset_id, :user_id, :description, :priority, :status, :created_at, :updated_at)'''
    params = {
        'asset_id': asset_id,
        'user_id': user_id,
        'description': description,
        'priority': priority,
        'status': status,
        'created_at': created_at,
        'updated_at': created_at
    }
    new_id = execute(sql, params)
    return jsonify({
        'id': str(new_id),
        'assetId': str(asset_id) if asset_id else '',
        'userId': str(user_id) if user_id else '',
        'description': description,
        'priority': priority,
        'status': status,
        'adminRemarks': '',
        'createdAt': str(created_at).split()[0],
        'updatedAt': str(created_at).split()[0]
    }), 201


@app.route('/api/issues/<int:issue_id>', methods=['PUT'])
def update_issue(issue_id):
    data = request.get_json() or {}
    # Accept both camelCase and snake_case
    admin_remarks = data.get('adminRemarks') or data.get('admin_remarks')
    status = data.get('status')
    
    sql = '''UPDATE issues SET admin_remarks = :admin_remarks, status = :status, updated_at = :updated_at
             WHERE id = :id'''
    params = {
        'id': issue_id,
        'admin_remarks': admin_remarks,
        'status': status or 'pending',
        'updated_at': datetime.utcnow().isoformat()
    }
    execute(sql, params)
    
    # Return updated issue
    rows = fetch_all('SELECT * FROM issues WHERE id = :id', {'id': issue_id})
    if rows:
        row = rows[0]
        return jsonify({
            'id': str(row.get('id')),
            'assetId': str(row.get('asset_id')) if row.get('asset_id') else '',
            'userId': str(row.get('user_id')) if row.get('user_id') else '',
            'description': row.get('description', ''),
            'priority': row.get('priority', 'medium'),
            'status': row.get('status', 'pending'),
            'adminRemarks': row.get('admin_remarks', ''),
            'createdAt': str(row.get('created_at')).split()[0] if row.get('created_at') else '',
            'updatedAt': str(row.get('updated_at')).split()[0] if row.get('updated_at') else ''
        })
    return jsonify({'ok': True})

# Auth endpoints are defined earlier in the file to avoid duplicate route registrations.
# The activate and login handlers near the top of this file are the active implementations.


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    flask_env = os.getenv('FLASK_ENV', 'development')
    debug_mode = flask_env == 'development'
    
    print("\n" + "="*60)
    print("Flask ITSM Server Starting")
    print("="*60)
    print(f"Environment: {flask_env}")
    print(f"Debug Mode: {debug_mode}")
    print(f"Database Connection Details:")
    print(f"  Host: {DB_HOST}:{DB_PORT}")
    print(f"  Database: {DB_NAME}")
    print(f"  User: {DB_USER}")
    print(f"  URL: {DATABASE_URL.replace(DB_PASS, '****')}")
    print("="*60)
    print(f"API available at: http://0.0.0.0:{port}")
    print("Debug connections: GET /api/debug/connection")
    print("="*60 + "\n")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
