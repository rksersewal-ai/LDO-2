# Local Backend Setup Guide

**Django + Waitress + LAN-filtered Backend**

---

## Prerequisites

- Python 3.11+
- pip or pip-tools
- (Optional) PostgreSQL 18 for production
- (Optional) Tesseract for image OCR

---

## Quick Start (5 minutes)

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your settings
# Key variables:
# - DJANGO_SECRET_KEY (change from default)
# - EDMS_ALLOWED_IP_RANGES (set to your LAN)
# - Database (SQLite default, or PostgreSQL)
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
# Username: admin
# Password: admin123 (or your choice)
```

### 6. Run Backend Server

```bash
python -m config.waitress_runner
# Server listens on 0.0.0.0:8765 by default
```

**Server is ready!** → http://localhost:8765

### 7. Run Frontend

```bash
cd artifacts/edms
pnpm dev
# Opens at http://localhost:5173
# Automatically proxies /api to http://127.0.0.1:8765
```

### 8. Test

```bash
# Health check
curl http://localhost:8765/api/health/status/

# Login
curl -X POST http://localhost:8765/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## Runtime Defaults

| Setting | Default | Notes |
|---------|---------|-------|
| Listen Address | `0.0.0.0:8765` | Waitress server |
| Database | SQLite (./db.sqlite3) | Set EDMS_DB_ENGINE=postgresql for PG |
| Storage | ./storage/ | Auto-created if missing |
| Debug | False | Set DEBUG=True only in development |
| LAN Filtering | Enabled | Check EDMS_ALLOWED_IP_RANGES |

---

## Database Options

### Option 1: SQLite (Default, Local Development)

**No additional setup needed.** Database is created automatically as `./db.sqlite3`

```bash
# In .env:
EDMS_SQLITE_PATH=./db.sqlite3
# Don't set EDMS_DB_ENGINE
```

### Option 2: PostgreSQL (Production Recommended)

**Setup PostgreSQL:**

```bash
# Windows: Download installer from https://www.postgresql.org/download/windows/
# Linux:
sudo apt install postgresql postgresql-contrib

# Create database and user
psql -U postgres
CREATE DATABASE edms_db;
CREATE USER edms_user WITH PASSWORD 'secure_password';
ALTER ROLE edms_user SET client_encoding TO 'utf8';
ALTER ROLE edms_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE edms_db TO edms_user;
\c edms_db
GRANT ALL ON SCHEMA public TO edms_user;
```

**Configure in .env:**

```bash
EDMS_DB_ENGINE=postgresql
POSTGRES_DB=edms_db
POSTGRES_USER=edms_user
POSTGRES_PASSWORD=secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_SSLMODE=prefer
```

Or use single connection string:

```bash
DATABASE_URL=postgresql://edms_user:secure_password@localhost:5432/edms_db
```

**Run migrations:**

```bash
python manage.py migrate
```

---

## LAN Configuration

### Secure Access from LAN

Set these variables to allow only trusted networks:

```bash
# Allow only internal IP ranges
EDMS_ALLOWED_IP_RANGES=192.168.0.0/16,172.16.0.0/12,10.0.0.0/8

# If behind a reverse proxy (nginx/IIS):
EDMS_TRUSTED_PROXY_IPS=192.168.1.100,10.0.0.50

# Browser-facing hostnames
DJANGO_ALLOWED_HOSTS=edms.local,edms-server,192.168.1.50
```

### Example LAN Setups

**Setup 1: Direct LAN Access**
```bash
# Computer on 192.168.1.50
EDMS_ALLOWED_IP_RANGES=192.168.0.0/16
DJANGO_ALLOWED_HOSTS=192.168.1.50,edms-server.local
EDMS_RUNTIME_HOST=0.0.0.0
EDMS_RUNTIME_PORT=8765
```

Access from another computer: `http://192.168.1.50:8765`

**Setup 2: Behind Nginx Reverse Proxy**
```bash
# Nginx on 192.168.1.100, app on 192.168.1.50
EDMS_ALLOWED_IP_RANGES=192.168.0.0/16
EDMS_TRUSTED_PROXY_IPS=192.168.1.100
DJANGO_ALLOWED_HOSTS=edms.local
EDMS_RUNTIME_HOST=127.0.0.1
EDMS_RUNTIME_PORT=8765
```

Access from browsers: `https://edms.local` (via nginx)

---

## OCR Setup (Optional)

### PDF Text Extraction (No Setup Needed)

✅ Works automatically for PDFs with selectable text
- No Tesseract required
- Uses built-in PDF parsing

### Image OCR (Requires Tesseract)

For scanning PDFs or image files:

**Windows:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run installer (default path: `C:\Program Files\Tesseract-OCR`)
3. In .env:
   ```bash
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

**Linux:**
```bash
sudo apt install tesseract-ocr
# TESSERACT_CMD=/usr/bin/tesseract (or just leave unset if on PATH)
```

**macOS:**
```bash
brew install tesseract
# TESSERACT_CMD=/usr/local/bin/tesseract
```

---

## Environment Variables Reference

### Required

| Variable | Purpose | Example |
|----------|---------|---------|
| DJANGO_SECRET_KEY | Django secret key | `your-secret-key-here` |
| DJANGO_ALLOWED_HOSTS | Allowed hostnames | `localhost,127.0.0.1,edms.local` |
| EDMS_ALLOWED_IP_RANGES | LAN IP ranges | `192.168.0.0/16,10.0.0.0/8` |
| EDMS_STORAGE_ROOT | File storage path | `./storage` |

### Runtime

| Variable | Purpose | Default |
|----------|---------|---------|
| EDMS_RUNTIME_PORT | Server port | `8765` |
| EDMS_RUNTIME_HOST | Listen address | `0.0.0.0` |
| EDMS_WAITRESS_HOST | Waitress bind host | `0.0.0.0` |
| DEBUG | Django debug mode | `False` |

### Database

| Variable | Purpose | Notes |
|----------|---------|-------|
| EDMS_SQLITE_PATH | SQLite file path | Default: ./db.sqlite3 |
| EDMS_DB_ENGINE | Database type | `postgresql` or unset (sqlite) |
| POSTGRES_* | PostgreSQL vars | Or use DATABASE_URL |
| DATABASE_URL | Connection string | Overrides discrete vars |

### Security (LAN)

| Variable | Purpose | Example |
|----------|---------|---------|
| EDMS_ALLOWED_IP_RANGES | Restrict to IPs | `192.168.0.0/16` |
| EDMS_TRUSTED_PROXY_IPS | Proxy IPs | `127.0.0.1,10.0.0.1` |
| EDMS_RUNTIME_HOST | Bind interface | `127.0.0.1` or `0.0.0.0` |

### OCR

| Variable | Purpose | Example |
|----------|---------|---------|
| TESSERACT_CMD | Tesseract path | `/usr/bin/tesseract` |

### CORS

| Variable | Purpose | Example |
|----------|---------|---------|
| CORS_ALLOWED_ORIGINS | Frontend origins | `http://localhost:5173` |

---

## Common Issues & Fixes

### Issue: Port Already in Use

```
Address already in use
```

**Fix:**
```bash
# Find process using port 8765
netstat -ano | findstr :8765  # Windows
lsof -i :8765                 # Linux/Mac

# Kill process or change EDMS_RUNTIME_PORT
export EDMS_RUNTIME_PORT=8766
python -m config.waitress_runner
```

### Issue: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:**
```bash
# In .env, ensure frontend URL is allowed:
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Issue: Cannot Access from Another Computer

```
Refused to connect / Connection timed out
```

**Check:**
1. Backend listening on `0.0.0.0` not `127.0.0.1`:
   ```bash
   EDMS_RUNTIME_HOST=0.0.0.0
   ```

2. IP range allows requester:
   ```bash
   EDMS_ALLOWED_IP_RANGES=192.168.0.0/16
   ```

3. Firewall allows port 8765:
   ```bash
   # Windows Firewall
   New-NetFirewallRule -DisplayName "Django 8765" -Direction Inbound -LocalPort 8765 -Protocol TCP -Action Allow
   ```

4. Django allowed hosts includes target:
   ```bash
   DJANGO_ALLOWED_HOSTS=192.168.1.50,edms.local
   ```

### Issue: Database Connection Error

```
psycopg2.OperationalError: could not connect to server
```

**Fix:**
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql  # Linux
pg_ctl status -D "C:\Program Files\PostgreSQL\18\data"  # Windows

# Test connection
psql -U edms_user -d edms_db -h localhost
```

### Issue: Tesseract Not Found

```
pytesseract.TesseractNotFoundError
```

**Fix:**
```bash
# Option 1: Add to PATH
export PATH="/usr/bin:$PATH"

# Option 2: Set TESSERACT_CMD in .env
TESSERACT_CMD=/usr/bin/tesseract
```

---

## Development Commands

```bash
# Run server (default 0.0.0.0:8765)
python -m config.waitress_runner

# Run with custom port
export EDMS_RUNTIME_PORT=9000
python -m config.waitress_runner

# Django shell for testing
python manage.py shell

# Check migrations
python manage.py showmigrations

# Create admin user
python manage.py createsuperuser

# Collect static files (production)
python manage.py collectstatic --noinput

# Clear cache
python manage.py clear_cache

# Export data
python manage.py dumpdata edms_api > data.json

# Import data
python manage.py loaddata data.json
```

---

## Production Checklist

Before deploying:

- [ ] `DJANGO_SECRET_KEY` set to strong random value
- [ ] `DEBUG = False`
- [ ] `EDMS_ALLOWED_IP_RANGES` limited to actual LAN
- [ ] Database: PostgreSQL (not SQLite)
- [ ] `CORS_ALLOWED_ORIGINS` set to frontend domain only
- [ ] Reverse proxy (Nginx/IIS) configured
- [ ] HTTPS/SSL enabled
- [ ] Backup strategy in place
- [ ] Monitoring & logging configured
- [ ] Tesseract installed (if using image OCR)

See `DEPLOYMENT.md` for full production setup.

---

## Vite Dev Server Proxy

The frontend automatically proxies `/api` requests to the backend:

```javascript
// artifacts/edms/vite.config.ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8765',
      changeOrigin: true,
    }
  }
}
```

To change proxy target:

```bash
export VITE_API_PROXY_TARGET=http://192.168.1.50:8765
pnpm dev
```

---

## Next Steps

1. ✅ Copy `.env.example` → `.env`
2. ✅ Run `python manage.py migrate`
3. ✅ Run `python manage.py createsuperuser`
4. ✅ Start backend: `python -m config.waitress_runner`
5. ✅ Start frontend: `pnpm dev`
6. ✅ Test at `http://localhost:5173` (login with superuser)

See `INTEGRATION_TEST_SUMMARY.md` for detailed testing steps.
