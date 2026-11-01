from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.core.security import verify_password, create_access_token
from backend.app.models.entities import User
from backend.app.schemas.erp import LoginRequest, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/login", response_model=TokenResponse, summary="Authenticate user with JWT")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Validates user credentials (email or username) and returns a signed JWT bearer token.
    Pre-configured Super Admin credentials:
      - Email: admin@forgeflow.com
      - Username: superadmin
      - Password: Admin@123456
    """
    identifier = payload.username_or_email.strip().lower()
    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.username.ilike(identifier))
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your username/email and password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your user account is suspended or inactive."
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user)
    )

@router.get("/me", response_model=UserProfileResponse, summary="Get authenticated user profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """Returns profile details of the authenticated caller."""
    return UserProfileResponse.model_validate(current_user)
