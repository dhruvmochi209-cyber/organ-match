# OrganMatch — Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

---

## 1. MySQL Database Setup

Start MySQL and run:
```sql
CREATE DATABASE organmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then update `backend/.env`:
```
DATABASE_URL=mysql+mysqlconnector://root:YOUR_MYSQL_PASSWORD@localhost/organmatch
```

---

## 2. Backend Setup (Flask)

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python app.py   # Creates tables automatically on first run
```

### Seed Sample Data
```bash
python seed.py
```

Backend runs at: **http://localhost:5000**

---

## 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Demo Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@organmatch.com | Admin@123 |
| Government | gov@organmatch.com | Gov@123 |
| Hospital Admin | apollo@hospital.com | Hospital@123 |
| Donor | rahul@donor.com | Donor@123 |
| Recipient | amit@recipient.com | Recipient@123 |

---

## Demo Workflow

1. **Login as Donor** (`rahul@donor.com`) → View dashboard, upload a medical report.
2. **Login as Hospital Admin** (`apollo@hospital.com`) → Verify the uploaded report, then review the pre-seeded match (Match #1) and set decision to "Approved."
3. **Login as Government** (`gov@organmatch.com`) → Review the hospital-approved match → Approve it.
4. **Login as Donor** again → See status advance to "Government Approved" on the timeline.
5. **Login as Government** → Navigate to Transplants → Mark as "In Progress" then "Success."
6. **Login as Admin** (`admin@organmatch.com`) → View Audit Logs to see all actions.
7. **Test AI Matching**: As Hospital Admin, first mark the donor as Verified via Admin > Users. Then as Donor, click "Find Matches" to trigger the AI scoring algorithm.

---

## Project Structure

```
organmatch/
├── backend/
│   ├── app.py           # Flask entry point
│   ├── config.py        # Configuration
│   ├── seed.py          # Sample data seeder
│   ├── models/          # SQLAlchemy ORM models
│   ├── routes/          # API route blueprints
│   ├── services/        # AI matching & report services
│   └── utils/           # DB, helpers, file upload
│
├── frontend/
│   └── src/
│       ├── pages/       # Role dashboards & forms
│       ├── components/  # Sidebar, Modal, Timeline
│       ├── services/    # API & auth services
│       └── context/     # AuthContext (JWT)
│
└── schema.sql           # Manual MySQL schema (optional)
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/donor/register` | Create donor profile |
| POST | `/api/donor/upload-report` | Upload medical document |
| POST | `/api/recipient/register` | Create recipient profile |
| POST | `/api/matches/generate` | Trigger AI matching |
| GET | `/api/matches/my-matches` | Get user's matches |
| POST | `/api/hospital/verify-report/<id>` | Verify medical report |
| POST | `/api/hospital/approve-match/<id>` | Hospital decision on match |
| POST | `/api/government/approve-match/<id>` | Government decision |
| POST | `/api/government/update-transplant/<id>` | Update transplant status |
| GET | `/api/admin/dashboard-stats` | System statistics |
| GET | `/api/admin/audit-logs` | Full audit trail |
