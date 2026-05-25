from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    # default=datetime.utcnow lagane se Python khud time generate karega
    created_at = Column(
        TIMESTAMP(timezone=True), 
        nullable=False, 
        default=datetime.utcnow,
        server_default=text('CURRENT_TIMESTAMP')
    )

    submissions = relationship("Submission", back_populates="owner")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, nullable=False)
    student_name = Column(String, nullable=False)
    pdf_url = Column(String, nullable=True)          
    extracted_text = Column(String, nullable=True)   
    ai_feedback = Column(String, nullable=True)      
    score = Column(Integer, nullable=True)           
    status = Column(String, nullable=False, server_default="PENDING") 
    
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), 
        nullable=False, 
        default=datetime.utcnow,
        server_default=text('CURRENT_TIMESTAMP')
    )
    
    owner = relationship("User", back_populates="submissions")