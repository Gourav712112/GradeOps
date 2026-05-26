# GradeOps: AI-Powered Bulk Script Evaluation Engine

GradeOps is a full-stack automated grading and evaluation platform designed to streamline academic and corporate artifact screening. It processes multi-file PDF payloads asynchronously, secures environments with robust authentication, and generates structured analytical reports.

## 🚀 Key Features
* **Asynchronous Multi-File Processing:** Handles bulk PDF uploads concurrently via optimized FastAPI endpoints.
* **Role-Based Workspaces:** Secured environment using OAuth2 with JWT Bearer tokens to isolate user state and session logs.
* **Relational Data Mapping:** Structured database architecture using SQLAlchemy ORM to track users and execution metrics.
* **Automated Excel Telemetry:** Custom report generator powered by OpenPyXL, delivering styled data matrices with auto-fitting grid layouts.
* **Stateful UI Dashboard:** Interactive React frontend equipped with synchronized token interceptors and dynamic pipeline monitors.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Axios
* **Backend:** FastAPI (Python), Uvicorn
* **Database & ORM:** SQLite / PostgreSQL, SQLAlchemy
* **Authentication:** JWT (JSON Web Tokens), Passlib
* **Reporting Engine:** OpenPyXL

## 📦 Project Structure
```text
GradeOps/
├── gradeops-backend/    # FastAPI Application, Database Modules, and API Endpoints
├── gradeops-frontend/   # React.js SPA, State Managers, and UI Components
└── .gitignore           # Global Version Control Exclusions
