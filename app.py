Python

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="your_mysql_password",  # <-- change this
        database="simple_app"
    )

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing fields'}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        hashed = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed))
        db.commit()
        return jsonify({'message': 'User created'}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 409
    finally:
        cursor.close()
        db.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if user and check_password_hash(user['password'], password):
        return jsonify({'id': user['id'], 'username': user['username']}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/users', methods=['GET'])
def get_users():
    username = request.headers.get('X-Username')
    if not username:
        return jsonify({'error': 'Unauthorized'}), 401

    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # verify user exists
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        return jsonify({'error': 'Unauthorized'}), 401

    cursor.execute("SELECT id, username, created_at FROM users")
    users = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(users), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    
