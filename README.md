# SchemeRadar — Government Scheme Rumor Detection

A full-stack web application that verifies the authenticity of claims about Indian government schemes by cross-referencing them against an official scheme database of 3,400+ entries.

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | React 18, Vite, Lucide Icons       |
| Backend  | FastAPI, SQLAlchemy, Uvicorn       |
| Database | PostgreSQL                         |
| ML       | Sentence-Transformers, FAISS, TF-IDF |

## Features

- **Rumor Detection** — Paste any text to verify against official scheme data
- **Related Schemes** — View 4 most similar government schemes with details
- **Public History** — See what rumors everyone is searching
- **Personal History** — Track your own searches (requires login)
- **Analytics Dashboard** — Charts, trends, and top-queried schemes
- **Hindi Support** — Full UI translation toggle (EN / हिंदी)

## Quick Start

### Prerequisites
- Python 3.11+ with a virtual environment (`.venv/`)
- Node.js 18+
- PostgreSQL running locally with database `rumor_detection`

### Run Locally
```powershell
# Start both backend and frontend
.\run-all.ps1

# Stop everything
.\stop-all.ps1
```

### Run with Docker
```bash
docker-compose up --build
```

### Backend only
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend only
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for a full breakdown.

```
Project-Antigravity/
├── backend/          # FastAPI backend (app/ package)
├── frontend/         # React + Vite frontend
├── scripts/          # Utility scripts
├── docs/             # Documentation
├── docker-compose.yml
├── run-all.ps1       # Start both services
└── stop-all.ps1      # Stop both services
```

## API Endpoints

| Method | Endpoint           | Auth     | Description                    |
|--------|--------------------|----------|--------------------------------|
| POST   | `/predict`         | Optional | Analyze text for rumors        |
| GET    | `/schemes/search`  | No       | Look up scheme details by name |
| GET    | `/history/public`  | No       | Public search history feed     |
| GET    | `/history`         | Yes      | Personal search history        |
| POST   | `/auth/register`   | No       | Create account                 |
| POST   | `/auth/login`      | No       | Sign in                        |

## Team

Built by **Palak, Tanish & Yash**
