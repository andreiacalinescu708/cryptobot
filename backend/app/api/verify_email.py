from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user, get_tenant_id
from app.services.email import send_verification_email, create_verification_code, verify_code
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["email-verification"])


class VerifyCodeRequest(BaseModel):
    code: str


@router.post("/send-verification-code")
def send_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """Trimite cod de verificare pe email."""
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Emailul este deja verificat"
        )
    
    # Generează cod
    code = create_verification_code(db, tenant_id)
    
    # Trimite email
    sent = send_verification_email(current_user.email, code)
    
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Eroare la trimiterea emailului"
        )
    
    return {
        "message": "Codul de verificare a fost trimis",
        "email": current_user.email
    }


@router.post("/verify-code")
def verify_email_code(
    request: VerifyCodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """Verifică codul introdus."""
    if current_user.is_verified:
        return {"message": "Emailul este deja verificat", "verified": True}
    
    is_valid = verify_code(db, tenant_id, request.code)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cod invalid sau expirat"
        )
    
    return {
        "message": "Email verificat cu succes",
        "verified": True
    }


@router.get("/verification-status")
def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """Verifică statusul verificării emailului."""
    return {
        "is_verified": current_user.is_verified,
        "email": current_user.email
    }
