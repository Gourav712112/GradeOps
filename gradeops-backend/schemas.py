from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# =====================================================================
# 🔐 AUTHENTICATION SCHEMAS (Purane waale check blocks)
# =====================================================================
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# =====================================================================
# 🌟 BULK SUBMISSION SCHEMAS (BULLETPROOF & OPTIONAL FIELDS)
# =====================================================================
class SubmissionBase(BaseModel):
    student_name: str
    status: str
    # 🌟 Inko Optional kiya taaki DB ka purana null ya empty data crash na kare
    file_path: Optional[str] = "N/A"
    score: Optional[int] = 0
    ai_feedback: Optional[str] = "No feedback generated yet."

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionOut(SubmissionBase):
    id: int

    class Config:
        from_attributes = True  # SQLAlchemy data extraction mapping trigger