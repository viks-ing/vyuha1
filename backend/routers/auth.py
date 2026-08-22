from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import uuid
from schemas import (
    LoginCredentials,
    SignupCredentials,
    AuthUser,
    AuthTokenResponse,
    ForgotPasswordParams,
    ResetPasswordParams,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# In-memory user database for demo
users_db = {
    "admin@vyuha.ai": {
        "id": "usr_vyuha_10928",
        "email": "admin@vyuha.ai",
        "fullName": "Supply Chain Manager",
        "password": "password123",
        "createdAt": datetime.now().isoformat(),
    }
}

@router.post("/login", response_model=AuthTokenResponse)
def login(credentials: LoginCredentials):
    email = credentials.email.strip().lower()
    if email not in users_db:
        # Register on the fly for demo convenience if non-error email
        if email == "error@vyuha.ai":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )
        
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        users_db[email] = {
            "id": user_id,
            "email": email,
            "fullName": "Enterprise User",
            "password": credentials.password,
            "createdAt": datetime.now().isoformat()
        }

    user_data = users_db[email]
    user = AuthUser(
        id=user_data["id"],
        email=user_data["email"],
        fullName=user_data.get("fullName", "User"),
        createdAt=user_data["createdAt"]
    )
    
    return AuthTokenResponse(
        user=user,
        token=f"vyuha_jwt_{user.id}_token"
    )

@router.post("/signup", response_model=AuthTokenResponse)
def signup(credentials: SignupCredentials):
    email = credentials.email.strip().lower()
    if not credentials.fullName or not email or not credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields are required."
        )

    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    users_db[email] = {
        "id": user_id,
        "email": email,
        "fullName": credentials.fullName,
        "password": credentials.password,
        "createdAt": datetime.now().isoformat()
    }

    user = AuthUser(
        id=user_id,
        email=email,
        fullName=credentials.fullName,
        createdAt=datetime.now().isoformat()
    )

    return AuthTokenResponse(
        user=user,
        token=f"vyuha_jwt_{user_id}_token"
    )

@router.post("/forgot-password")
def forgot_password(params: ForgotPasswordParams):
    if not params.email or "@" not in params.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address."
        )
    return {"success": True, "message": "Password reset instructions sent to your email."}

@router.post("/reset-password")
def reset_password(params: ResetPasswordParams):
    if not params.newPassword or len(params.newPassword) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    return {"success": True, "message": "Password updated successfully."}
