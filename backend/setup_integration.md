# Django Backend Setup & Integration Testing

## Quick Start (5 minutes)

### 1. Create Django App (if not done)

```bash
cd backend
python manage.py startapp edms_api
```

### 2. Register App in Settings

```python
# backend/edms/settings.py
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'edms_api',  # ← Add this
]

# Include REST Framework settings
# (See backend/edms/settings_api.py for full config)
```

### 3. Create Database Migrations

```bash
python manage.py makemigrations edms_api
python manage.py migrate
```

### 4. Create Superuser (Admin)

```bash
python manage.py createsuperuser
# Username: admin
# Password: admin123
```

### 5. Run Backend Server

```bash
python manage.py runserver 0.0.0.0:8765
```

Server is now running at `http://localhost:8765`

### 6. Test API Endpoint

```bash
# Health check
curl http://localhost:8765/api/health/status/

# Should return:
# {
#   "status": "OK",
#   "timestamp": "...",
#   "services": {...}
# }
```

### 7. Start Frontend & Test

```bash
cd artifacts/edms
pnpm dev
# Opens at http://localhost:5173

# Login with admin / admin123
```

---

## Models Overview

### Document
- **Purpose**: Core document entity
- **Key Fields**: name, type, status, ocr_status, extracted_text
- **Relationships**: ForeignKey to User (author), OneToOne to OcrJob

### DocumentVersion
- **Purpose**: Track revision history
- **Key Fields**: revision number, file, change notes
- **Relationships**: ForeignKey to Document

### WorkRecord
- **Purpose**: Work/maintenance logs
- **Key Fields**: description, pl_number, status, days_taken
- **Relationships**: ForeignKey to User (user_name, verified_by)

### PlItem
- **Purpose**: Product/Locomotive reference data
- **Key Fields**: name, part_number, specifications
- **Relationships**: None (standalone)

### Case
- **Purpose**: Discrepancy/issue tracking
- **Key Fields**: title, severity, status, resolution
- **Relationships**: ForeignKey to User (assigned_to), ForeignKey to Document

### OcrJob
- **Purpose**: Async OCR processing
- **Key Fields**: status, extracted_text, confidence
- **Relationships**: OneToOne to Document

### Approval
- **Purpose**: Approval workflows
- **Key Fields**: entity_type, status, approval details
- **Relationships**: ForeignKey to User (multiple roles)

### AuditLog
- **Purpose**: Immutable activity log
- **Key Fields**: action, module, user, severity
- **Relationships**: ForeignKey to User (read-only)

---

## Integration Testing Steps

### Test 1: Authentication

```bash
# Login endpoint
curl -X POST http://localhost:8765/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Expected response:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "user": {
#     "id": 1,
#     "username": "admin",
#     "email": "admin@example.com"
#   }
# }
```

**In Browser:**
1. Open http://localhost:5173
2. Username: `admin`
3. Password: `admin123`
4. Click Sign In
5. Should redirect to Dashboard

### Test 2: Create Document

```bash
# Get auth token first
TOKEN=$(curl -s -X POST http://localhost:8765/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# Create document
curl -X POST http://localhost:8765/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Document" \
  -F "type=PDF" \
  -F "status=Draft" \
  -F "file=@/path/to/file.pdf"
```

**In Browser:**
1. Go to Document Hub (`/documents`)
2. Should show existing documents
3. Try creating a new document (if upload button exists)

### Test 3: List Documents

```bash
# Get token
TOKEN=<your-token-from-login>

# List all documents
curl -X GET http://localhost:8765/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# With filters
curl -X GET "http://localhost:8765/api/documents/?status=Approved&ocr_status=Completed" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 4: Dashboard Stats

```bash
TOKEN=<your-token>

curl -X GET http://localhost:8765/api/dashboard/stats/ \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "documents": {
#     "total": 5,
#     "approved": 3,
#     "in_review": 1,
#     "draft": 1
#   },
#   "approvals": {...},
#   "ocr_jobs": {...}
# }
```

**In Browser:**
1. Go to Dashboard (`/`)
2. KPI cards should show real numbers from API
3. Click on a KPI card to see drill-down

### Test 5: Search

```bash
TOKEN=<your-token>

curl -X GET "http://localhost:8765/api/search/?q=valve&scope=DOCUMENTS" \
  -H "Authorization: Bearer $TOKEN"
```

**In Browser:**
1. Go to Search Explorer (`/search`)
2. Type a search query
3. Should show real results from API

### Test 6: Audit Log

```bash
TOKEN=<your-token>

curl -X GET "http://localhost:8765/api/audit/log/?user=admin&severity=Info" \
  -H "Authorization: Bearer $TOKEN"
```

**In Browser:**
1. Go to Audit Log (`/audit`)
2. Filter by user/date/severity
3. Should show real audit entries

---

## Common Issues & Fixes

### Issue: CORS Error

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:8765/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:**
```python
# backend/edms/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
]
```

### Issue: 401 Unauthorized

**Problem:** API returns 401 even with valid credentials

**Check:**
1. Token is in `Authorization` header: `Bearer <token>`
2. Token hasn't expired (default: 24 hours)
3. Token was obtained from same backend instance

### Issue: Database Connection Error

**Error:**
```
psycopg2.OperationalError: could not connect to server
```

**Fix:**
```bash
# Ensure PostgreSQL is running
# Windows:
pg_ctl -D "C:\Program Files\PostgreSQL\18\data" start

# Linux:
sudo systemctl start postgresql

# Test connection:
psql -U edms_user -d edms_db -h localhost
```

### Issue: No Documents Showing

**Cause:** Database is empty

**Fix:**
```bash
# Create test document via API
# OR go to Django admin and create manually
python manage.py shell
>>> from edms_api.models import Document
>>> from django.contrib.auth.models import User
>>> user = User.objects.get(username='admin')
>>> Document.objects.create(name='Test', type='PDF', author=user, status='Approved')
```

### Issue: Models Not Found

**Error:**
```
ModuleNotFoundError: No module named 'edms_api.models'
```

**Fix:**
1. Ensure `edms_api` is in `INSTALLED_APPS`
2. Run migrations: `python manage.py migrate`
3. Restart server

---

## Development Workflow

### 1. Make Model Changes

```bash
# Edit backend/edms_api/models.py
# Add/modify fields
```

### 2. Create Migrations

```bash
python manage.py makemigrations edms_api
# Creates migration files in edms_api/migrations/
```

### 3. Apply Migrations

```bash
python manage.py migrate
# Applies changes to database
```

### 4. Test in Django Admin

```bash
# Visit http://localhost:8765/admin
# Login with superuser credentials
# Should see new fields/models
```

### 5. Test via API

```bash
# Use curl or Postman to test endpoints
curl http://localhost:8765/api/documents/ -H "Authorization: Bearer $TOKEN"
```

### 6. Verify in Frontend

```bash
# Should see changes reflected in React UI
# If using mock data, no visible change
# If using real API, will see new data
```

---

## Performance Tuning

### Add Database Indexes

Models already have indexes on common query fields:
- `status`, `author`, `user`, `severity`
- `created_at`, `ocr_status`, `date`

These are automatically created with migrations.

### Connection Pooling

```python
# backend/edms/settings.py
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,  # ← Connection pool timeout
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

### Pagination

API returns 20 items per page by default. Override in queries:

```bash
# Get specific page
curl "http://localhost:8765/api/documents/?page=2"

# Custom page size (up to 100)
curl "http://localhost:8765/api/documents/?page_size=50"
```

---

## Next Steps

1. ✅ Models created with all fields and relationships
2. ✅ Admin interface registered
3. ✅ API endpoints ready (in `edms_api/views.py`)
4. ⏳ Run migrations: `python manage.py migrate`
5. ⏳ Create superuser: `python manage.py createsuperuser`
6. ⏳ Test integration with curl commands above
7. ⏳ Verify in browser at http://localhost:5173

---

## Admin Interface

After running migrations, access Django admin:

```
http://localhost:8765/admin
Login: admin / admin123
```

From admin you can:
- ✅ Create/edit documents, work records, cases
- ✅ View audit logs
- ✅ Manage users and permissions
- ✅ Monitor approvals

---

## Useful Commands

```bash
# Show all models
python manage.py inspectdb

# Check migrations status
python manage.py showmigrations

# Clear cache
python manage.py clear_cache

# Create test data
python manage.py shell < load_test_data.py

# Export data
python manage.py dumpdata edms_api > data.json

# Import data
python manage.py loaddata data.json

# Delete all data (reset database)
python manage.py flush  # WARNING: Deletes everything!
```

---

For more details, see:
- `DEPLOYMENT.md` — Production setup
- `BACKEND_INTEGRATION.md` — Frontend integration
- Django docs: https://docs.djangoproject.com/
- DRF docs: https://www.django-rest-framework.org/
