from flask import Flask, jsonify, request, g
from flask_cors import CORS
from backend.models import Item, User
from backend.auth import require_auth, generate_token
import json
import os

app = Flask(__name__)
CORS(app)

# In-memory data store
items_db = [
    Item(1, "Laptop", "High-performance laptop", 999.99, 10),
    Item(2, "Mouse", "Wireless mouse", 29.99, 50),
    Item(3, "Keyboard", "Mechanical keyboard", 89.99, 25)
]

users_db = [
    User(1, "admin", "admin@example.com", "admin", "hashed_password_123"),
    User(2, "john_doe", "john@example.com", "user", "hashed_password_456")
]

next_item_id = 4
next_user_id = 3

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "message": "API is running"
    })

@app.route('/api/items', methods=['GET'])
@require_auth
def list_items():
    """List all items - requires authentication"""
    return jsonify({
        "items": [item.to_dict() for item in items_db],
        "total": len(items_db)
    })

@app.route('/api/items', methods=['POST'])
@require_auth
def create_item():
    """Create a new item - requires authentication"""
    global next_item_id
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    required_fields = ['name', 'description', 'price', 'quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    if not isinstance(data['price'], (int, float)) or data['price'] < 0:
        return jsonify({"error": "Price must be a positive number"}), 400
    
    if not isinstance(data['quantity'], int) or data['quantity'] < 0:
        return jsonify({"error": "Quantity must be a non-negative integer"}), 400
    
    new_item = Item(
        id=next_item_id,
        name=data['name'],
        description=data['description'],
        price=data['price'],
        quantity=data['quantity']
    )
    items_db.append(new_item)
    next_item_id += 1
    
    return jsonify({
        "message": "Item created successfully",
        "item": new_item.to_dict()
    }), 201

@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    """Get a specific item - no auth required for simplicity"""
    item = next((item for item in items_db if item.id == item_id), None)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    return jsonify({"item": item.to_dict()})

@app.route('/api/items/<int:item_id>', methods=['PUT'])
@require_auth
def update_item(item_id):
    """Update an item - requires authentication"""
    item = next((item for item in items_db if item.id == item_id), None)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    if 'name' in data:
        item.name = data['name']
    if 'description' in data:
        item.description = data['description']
    if 'price' in data:
        if not isinstance(data['price'], (int, float)) or data['price'] < 0:
            return jsonify({"error": "Price must be a positive number"}), 400
        item.price = data['price']
    if 'quantity' in data:
        if not isinstance(data['quantity'], int) or data['quantity'] < 0:
            return jsonify({"error": "Quantity must be a non-negative integer"}), 400
        item.quantity = data['quantity']
    
    return jsonify({
        "message": "Item updated successfully",
        "item": item.to_dict()
    })

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
@require_auth
def delete_item(item_id):
    """Delete an item - requires authentication"""
    global items_db
    item = next((item for item in items_db if item.id == item_id), None)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    items_db = [item for item in items_db if item.id != item_id]
    return jsonify({"message": "Item deleted successfully"})

@app.route('/api/users', methods=['GET'])
@require_auth
def list_users():
    """List all users - requires admin authentication"""
    # Check if user is admin
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    return jsonify({
        "users": [user.to_dict() for user in users_db],
        "total": len(users_db)
    })

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user - no auth required for registration"""
    global next_user_id
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if username already exists
    if any(user.username == data['username'] for user in users_db):
        return jsonify({"error": "Username already exists"}), 409
    
    # Check if email already exists
    if any(user.email == data['email'] for user in users_db):
        return jsonify({"error": "Email already exists"}), 409
    
    new_user = User(
        id=next_user_id,
        username=data['username'],
        email=data['email'],
        role="user",
        password_hash=f"hashed_{data['password']}"  # In reality, use proper hashing
    )
    users_db.append(new_user)
    next_user_id += 1
    
    # Generate token for the new user
    token = generate_token(new_user.id, new_user.username, new_user.role)
    
    return jsonify({
        "message": "User created successfully",
        "user": new_user.to_dict(),
        "token": token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint - no auth required"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    user = next((user for user in users_db if user.username == username), None)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # In reality, check password hash
    if user.password_hash != f"hashed_{password}":
        return jsonify({"error": "Invalid credentials"}), 401
    
    token = generate_token(user.id, user.username, user.role)
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
