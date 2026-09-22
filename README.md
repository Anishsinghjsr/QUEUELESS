# QueueLess — Smart Queue & Appointment Management System

A resume-ready full-stack project built with Django REST Framework, React, Tailwind CSS, and PostgreSQL-ready configuration.

## Features
- JWT authentication
- User registration/login
- Organization and service management
- Digital token generation
- Queue position and estimated wait time
- Staff/admin queue controls
- Responsive React + Tailwind UI
- Analytics-ready API
- SQLite works locally out of the box; PostgreSQL supported through environment variables

## Run backend

```powershell
cd backend
python -m venv venv
.env\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API: http://127.0.0.1:8000/api/

## Run frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Set `VITE_API_URL` in `frontend/.env` if your backend URL differs.

## Demo flow
1. Register a user.
2. Login.
3. Create a token from the Services page.
4. Open My Token to see queue position.
5. Use Django admin to create organizations/services and manage data.
6. Staff/admin endpoints are ready for extension.

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL-compatible hosted database
