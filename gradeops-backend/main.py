import os
import sys

# Dynamic runtime environment directory locator path patch
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import models
import auth
import submissions

app = FastAPI(title="GradeOps AI Engine Core")

# CORS middleware configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core engine database serialization init check
models.Base.metadata.create_all(bind=database.engine)

# Standard sub-route inclusions
app.include_router(auth.router)
app.include_router(submissions.router)

@app.get("/")
def read_root():
    return {"message": "GradeOps Telemetry Microservice Layer Online"}