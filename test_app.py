import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"Hello! Flask is running." in response.data

def test_register_missing_fields(client):
    response = client.post('/api/register', json={})
    assert response.status_code == 400
    assert response.get_json()['error'] == 'Missing fields'
