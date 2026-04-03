# Phase 1: Codebase Discovery - Dependency and Flow Map

## 1. Top-Level Folders
- `backend/`: Django REST Framework backend application.
- `src/`: Core frontend React application (Vite/TypeScript).
- `artifacts/`: pnpm workspace containing:
  - `api-server/`: Node/Express mockup API server.
  - `edms/`: Frontend EDMS application (React/Vite).
  - `mockup-sandbox/`: Sandbox application.
- `lib/`: Shared libraries for the JS/TS workspace (`api-zod`, `api-spec`, `db`, `api-client-react`).
- `scripts/`: Utility scripts for workspace management.
- `FileProcessor/`: Background scripts for file processing (`process_unique_files.py`).

## 2. Dependency Manifests
- **Python**: `backend/requirements.txt`, `backend/requirements-ocr.txt`
- **Node/TypeScript**: `package.json` (root), `pnpm-workspace.yaml`, and individual `package.json` inside `artifacts/*/`, `lib/*/`, and `scripts/`.

## 3. Environment Configuration Files
- `backend/.env.example`
- `backend/edms/settings.py` (Django settings and DB configuration)

## 4. Database Migration Files
Located in `backend/<app>/migrations/`:
- `edms_api`: Core legacy API migrations
- `shared`: Shared app migrations
- `work`: Work ledger app migrations
- `documents`: Document management migrations

## 5. API Route Definitions
Located in Django `urls.py` files:
- `backend/edms/urls.py` (root URLconf)
- `backend/edms/api_v1_urls.py`
- `backend/edms/legacy_api_urls.py`
- `backend/shared/urls.py`
- `backend/documents/urls.py`
- `backend/config_mgmt/urls.py`
- `backend/work/urls.py`

## 6. Test Files and Coverage
- Backend: Modularized under `backend/tests/` and `backend/<app>/tests/`
- Frontend/Node: Distributed via `.test.ts` files (e.g., `src/src/lib/bomData.test.ts`)
- Automated coverage config is minimal and uses Django default test runners and Vitest.

## 7. Deployment and CI/CD Scripts
- `backend/gunicorn_config.py`
- `backend/nginx.conf`
- Note: Missing Dockerfiles and CI/CD pipelines (e.g., GitHub Actions, GitLab CI).

## 8. Inter-Service and Flow Dependency Map
- **Frontend** (`src/` / `artifacts/edms/`) communicates with the **Django Backend** (`backend/`) via HTTP requests.
- **Django Backend** orchestrates workflows relying on:
  - PostgreSQL / SQLite for persistent storage.
  - Redis + Celery for background processing (OCR, Deduplication).
- **FileProcessor** runs as an external or integrated cron/script layer to process and deduplicate files.
