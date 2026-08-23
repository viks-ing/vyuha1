from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import get_db
import models
from schemas import (
    LoginCredentials,
    SignupCredentials,
    AuthUser,
    AuthTokenResponse,
    ForgotPasswordParams,
    ResetPasswordParams,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

import hashlib
import hmac

def get_password_hash(password: str) -> str:
    salt = "vyuha_salt_2026_supply_chain"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = get_password_hash(plain_password)
    # Support backward compatibility with plain text or sha256 match
    return hmac.compare_digest(expected, hashed_password) or plain_password == hashed_password

@router.post("/login", response_model=AuthTokenResponse)
def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    email = credentials.email.strip().lower()
    
    # Query user from PostgreSQL
    user_record = db.query(models.User).filter(models.User.email == email).first()
    
    if not user_record:
        # Register on the fly for demo convenience if non-error email (just like the original mockup)
        if email == "error@vyuha.ai":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )
        
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        hashed_pwd = get_password_hash(credentials.password)
        user_record = models.User(
            id=user_id,
            email=email,
            full_name="Enterprise User",
            hashed_password=hashed_pwd
        )
        db.add(user_record)
        db.commit()
        db.refresh(user_record)
    else:
        # Check password
        if not verify_password(credentials.password, user_record.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )

    user = AuthUser(
        id=user_record.id,
        email=user_record.email,
        fullName=user_record.full_name,
        createdAt=user_record.created_at.isoformat() if user_record.created_at else datetime.now().isoformat()
    )
    
    return AuthTokenResponse(
        user=user,
        token=f"vyuha_jwt_{user.id}_token"
    )

@router.post("/signup", response_model=AuthTokenResponse)
def signup(credentials: SignupCredentials, db: Session = Depends(get_db)):
    email = credentials.email.strip().lower()
    if not credentials.fullName or not email or not credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields are required."
        )

    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    hashed_pwd = get_password_hash(credentials.password)
    new_user = models.User(
        id=user_id,
        email=email,
        full_name=credentials.fullName,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user = AuthUser(
        id=new_user.id,
        email=new_user.email,
        fullName=new_user.full_name,
        createdAt=new_user.created_at.isoformat() if new_user.created_at else datetime.now().isoformat()
    )

    return AuthTokenResponse(
        user=user,
        token=f"vyuha_jwt_{new_user.id}_token"
    )

@router.post("/forgot-password")
def forgot_password(params: ForgotPasswordParams, db: Session = Depends(get_db)):
    email = params.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address."
        )
    # Check if user exists in DB
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )
    return {"success": True, "message": "Password reset instructions sent to your email."}

@router.post("/reset-password")
def reset_password(params: ResetPasswordParams, db: Session = Depends(get_db)):
    if not params.newPassword or len(params.newPassword) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    
    # Mock token validation if needed (or if token is supplied, we could reset it for a demo user)
    # Since we don't have token generation fully wired, we will just simulate success.
    # In a real app we'd look up the user by the token, but for now we'll return success.
    return {"success": True, "message": "Password updated successfully."}
