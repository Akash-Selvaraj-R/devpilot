# Demo API Application

A simple Flask REST API for managing items and users.

## Structure
- `backend/app.py` - Main Flask application
- `backend/models.py` - Data models
- `backend/auth.py` - Authentication (incomplete)
- `tests/test_api.py` - API tests
- `requirements.txt` - Dependencies

## Running
```bash
pip install -r requirements.txt
python backend/app.py
```

## Testing
```bash
pytest tests/
```

## Known Issues
- Authentication is not fully implemented
- Some tests may fail
