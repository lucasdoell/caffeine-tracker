# Cornell Big Red Makeathon Spring 2025

Full-stack application with Vite frontend and Django backend.

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .\venv\Scripts\activate
uv pip install -r pyproject.toml
python manage.py migrate
python manage.py runserver
```
