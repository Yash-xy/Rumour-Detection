# Project Structure

```
Project-Antigravity/
│
├── backend/                        # FastAPI backend application
│   ├── app/                        # Main Python package
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app creation, CORS, route registration
│   │   ├── config.py               # Environment variables & settings
│   │   ├── database.py             # SQLAlchemy engine, session, Base
│   │   ├── models.py               # ORM models (User, History)
│   │   ├── schemas.py              # Pydantic request/response models
│   │   ├── security.py             # JWT tokens & password hashing
│   │   ├── routes/                 # API endpoint modules
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # /auth/register, /auth/login, /auth/logout
│   │   │   ├── history.py          # /history, /history/public, /history/{id}
│   │   │   ├── predict.py          # /predict (rumor detection)
│   │   │   └── schemes.py          # /schemes/search (scheme lookup)
│   │   └── services/               # Business logic
│   │       ├── __init__.py
│   │       └── rumor_detector.py   # Claim verification engine (FAISS/TF-IDF/embeddings)
│   ├── data/
│   │   └── govt_schemes.csv        # Government schemes dataset (3,400 entries)
│   ├── scheme_index.faiss          # Pre-built FAISS vector index (generated)
│   ├── scheme_metadata.pkl         # Serialized scheme metadata (generated)
│   ├── Dockerfile                  # Production Docker image
│   ├── Dockerfile.dev              # Development Docker image (lightweight)
│   ├── .dockerignore
│   ├── requirements.txt            # Full dependencies (with ML)
│   └── requirements-lite.txt       # Lightweight dependencies (no ML)
│
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                 # Root component with routing & providers
│   │   ├── main.jsx                # ReactDOM entry point
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Footer.jsx
│   │   │   ├── HistoryItem.jsx     # Expandable history entry with analysis card
│   │   │   ├── InputForm.jsx       # Text input with validation
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx          # Navigation bar with language toggle
│   │   │   ├── ResultDisplay.jsx   # Analysis result card
│   │   │   ├── SchemeDetailPopup.jsx # Single scheme detail modal
│   │   │   └── SchemePopup.jsx     # Related schemes modal (4 cards)
│   │   ├── context/                # React contexts
│   │   │   ├── AppContext.jsx      # User, history, theme state
│   │   │   └── LanguageContext.jsx # EN/HI translations & toggle
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── CheckPage.jsx       # Rumor analysis page
│   │   │   ├── DashboardPage.jsx   # Analytics dashboard
│   │   │   ├── HistoryPage.jsx     # Public & personal history
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios API client & endpoint functions
│   │   └── styles/
│   │       └── globals.css         # Complete design system & component styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              # Vite config with API proxy
│   ├── .env                        # Local environment variables
│   └── .env.example
│
├── scripts/                        # Utility & one-time scripts
│   ├── build_index.py              # Generate FAISS index from CSV
│   └── check_meta.py              # Debug: inspect metadata
│
├── docs/                           # Documentation
│   └── STRUCTURE.md                # This file
│
├── .github/workflows/              # CI/CD pipelines
│   └── docker-build-publish.yml
│
├── .gitignore                      # Git ignore rules
├── .env.example                    # Root environment template
├── README.md                       # Project overview & quick start
├── docker-compose.yml              # Docker multi-service config
├── run-all.ps1                     # Start backend + frontend locally
└── stop-all.ps1                    # Stop backend + frontend
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `backend/app/` as a package | Enables clean imports (`from app.models import User`), separates concerns |
| `routes/` sub-package | Each API domain (auth, history, predict) in its own module |
| `services/` sub-package | Business logic isolated from HTTP layer — testable independently |
| `security.py` (not `utils.py`) | Descriptive naming; contains only auth-related utilities |
| `config.py` | Single source of truth for all environment variables |
| `frontend/` (not `Rumour-Detection/`) | Consistent, standard naming matching `backend/` |
