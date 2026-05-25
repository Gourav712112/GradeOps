from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models
import schemas
import auth_utils
from database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/signup", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    hashed_pwd = auth_utils.hash_password(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # 🌟 FIXED MASTER BYPASS: Database se real user match karke token generate hoga
    if user_credentials.username == "prof_sharma" and user_credentials.password == "SecurePassword123":
        user = db.query(models.User).filter(models.User.username == "prof_sharma").first()
        if user:
            # Agar user database mein mil gaya, toh uski real dynamic identity identity supply karo
            access_token = auth_utils.create_access_token(data={"sub": str(user.username)})
            return {"access_token": access_token, "token_type": "bearer"}

    # Aapka original database authorization code
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user or not auth_utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    access_token = auth_utils.create_access_token(data={"sub": str(user.username)})
    return {"access_token": access_token, "token_type": "bearer"}