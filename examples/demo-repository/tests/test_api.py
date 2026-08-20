import pytest
import requests
import time
import threading
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app, items_db, users_db

class TestAPIServer:
    """Test class that manages the Flask server"""
    
    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        """Start and stop the Flask server for testing"""
        # Reset data stores
        items_db.clear()
        users_db.clear()
        
        # Add test data
        from backend.models import Item, User
        items_db.extend([
            Item(1, "Test Item 1", "Description 1", 10.99, 5),
            Item(2, "Test Item 2", "Description 2", 20.99, 10)
        ])
        users_db.extend([
            User(1, "testuser", "test@example.com", "user", "hashed_password"),
            User(2, "admin", "admin@example.com", "admin", "hashed_admin_password")
        ])
        
        # Configure test client
        app.config['TESTING'] = True
        self.client = app.test_client()
        
        yield
        
        # Cleanup after tests
        items_db.clear()
        users_db.clear()

class TestHealthEndpoint(TestAPIServer):
    """Tests for health endpoint"""
    
    def test_health_check(self):
        """Test that health endpoint returns healthy status"""
        response = self.client.get('/api/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'version' in data

class TestItemEndpoints(TestAPIServer):
    """Tests for item endpoints"""
    
    def test_list_items_without_auth(self):
        """Test that listing items without auth returns 401"""
        # This test EXPECTS 401 but will get 500 due to the bug in auth.py
        response = self.client.get('/api/items')
        # After the bug is fixed, this should pass with 401
        assert response.status_code == 401, f"Expected 401 but got {response.status_code}"
        data = response.get_json()
        assert 'error' in data
    
    def test_create_item_without_auth(self):
        """Test that creating item without auth returns 401"""
        new_item = {
            "name": "New Item",
            "description": "A new test item",
            "price": 15.99,
            "quantity": 3
        }
        response = self.client.post('/api/items', 
                                   json=new_item,
                                   content_type='application/json')
        # This test EXPECTS 401 but will get 500 due to the bug in auth.py
        assert response.status_code == 401, f"Expected 401 but got {response.status_code}"
        data = response.get_json()
        assert 'error' in data
    
    def test_get_item(self):
        """Test getting a specific item (no auth required)"""
        response = self.client.get('/api/items/1')
        assert response.status_code == 200
        data = response.get_json()
        assert data['item']['name'] == 'Test Item 1'
    
    def test_get_nonexistent_item(self):
        """Test getting a non-existent item"""
        response = self.client.get('/api/items/999')
        assert response.status_code == 404

class TestUserEndpoints(TestAPIServer):
    """Tests for user endpoints"""
    
    def test_list_users_without_auth(self):
        """Test that listing users without auth returns 401"""
        response = self.client.get('/api/users')
        # This test EXPECTS 401 but will get 500 due to the bug in auth.py
        assert response.status_code == 401, f"Expected 401 but got {response.status_code}"
        data = response.get_json()
        assert 'error' in data
    
    def test_create_user(self):
        """Test creating a new user (no auth required)"""
        new_user = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123"
        }
        response = self.client.post('/api/users',
                                   json=new_user,
                                   content_type='application/json')
        assert response.status_code == 201
        data = response.get_json()
        assert 'token' in data
        assert data['user']['username'] == 'newuser'
    
    def test_create_duplicate_user(self):
        """Test creating a duplicate user"""
        duplicate_user = {
            "username": "testuser",
            "email": "another@example.com",
            "password": "password123"
        }
        response = self.client.post('/api/users',
                                   json=duplicate_user,
                                   content_type='application/json')
        assert response.status_code == 409

class TestAuthenticationFlow(TestAPIServer):
    """Tests for authentication flow"""
    
    def test_login(self):
        """Test login endpoint"""
        login_data = {
            "username": "testuser",
            "password": "password"  # This matches our test data
        }
        response = self.client.post('/api/auth/login',
                                   json=login_data,
                                   content_type='application/json')
        assert response.status_code == 200
        data = response.get_json()
        assert 'token' in data
        assert data['user']['username'] == 'testuser'
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "username": "testuser",
            "password": "wrongpassword"
        }
        response = self.client.post('/api/auth/login',
                                   json=login_data,
                                   content_type='application/json')
        assert response.status_code == 401

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
