from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.delete("/delete-my-account")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Șterge contul utilizatorului curent și TOATE datele asociate."""
    user_id = current_user.id
    email = current_user.email
    
    # Șterge în ordinea corectă (constraints)
    db.execute(text("DELETE FROM email_verifications WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM trades WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM strategy_configs WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM binance_api_keys WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM payments WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM users WHERE id = :user_id"), {"user_id": user_id})
    
    db.commit()
    
    return {
        "message": "Cont șters cu succes",
        "email": email,
        "deleted": True
    }


@router.delete("/delete-all-my-data")
def delete_all_my_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Șterge doar datele, păstrează contul."""
    user_id = current_user.id
    
    db.execute(text("DELETE FROM email_verifications WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM trades WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM strategy_configs WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM binance_api_keys WHERE tenant_id = :user_id"), {"user_id": user_id})
    db.execute(text("DELETE FROM payments WHERE tenant_id = :user_id"), {"user_id": user_id})
    
    # Reset verified status
    db.execute(text("UPDATE users SET is_verified = false WHERE id = :user_id"), {"user_id": user_id})
    
    db.commit()
    
    return {
        "message": "Toate datele au fost șterse",
        "deleted_data": True
    }
