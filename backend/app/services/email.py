import random
import string
from datetime import datetime, timedelta
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.email_verification import EmailVerification
from app.models.user import User

settings = get_settings()


def generate_verification_code() -> str:
    """Generează cod de 6 cifre."""
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(to_email: str, code: str) -> bool:
    """Trimite email cu cod de verificare via SendGrid."""
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        
        message = Mail(
            from_email=settings.FROM_EMAIL,
            to_emails=to_email,
            subject='Codul tău de verificare - CryptoBot',
            html_content=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0ea5e9;">CryptoBot</h2>
                <p>Bună,</p>
                <p>Codul tău de verificare este:</p>
                <div style="background: #f0f9ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0369a1; border-radius: 8px; margin: 20px 0;">
                    {code}
                </div>
                <p>Acest cod expiră în 15 minute.</p>
                <p style="color: #666; font-size: 12px;">Dacă nu ai solicitat acest cod, poți ignora acest email.</p>
            </div>
            '''
        )
        
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def create_verification_code(db: Session, user_id: int) -> Optional[str]:
    """Creează cod nou de verificare și șterge cele vechi."""
    # Șterge codurile vechi
    db.query(EmailVerification).filter(
        EmailVerification.tenant_id == user_id
    ).delete()
    
    # Generează cod nou
    code = generate_verification_code()
    
    # Creează înregistrare
    verification = EmailVerification(
        tenant_id=user_id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    
    db.add(verification)
    db.commit()
    
    return code


def verify_code(db: Session, user_id: int, code: str) -> bool:
    """Verifică dacă codul e corect și încă valid."""
    verification = db.query(EmailVerification).filter(
        EmailVerification.tenant_id == user_id,
        EmailVerification.code == code,
        EmailVerification.is_verified == False,
        EmailVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not verification:
        # Incrementăm încercările
        db.query(EmailVerification).filter(
            EmailVerification.tenant_id == user_id,
            EmailVerification.code == code
        ).update({"attempts": EmailVerification.attempts + 1})
        db.commit()
        return False
    
    # Marcăm ca verificat
    verification.is_verified = True
    verification.verified_at = datetime.utcnow()
    db.commit()
    
    # Marcăm și userul ca verificat
    db.query(User).filter(User.id == user_id).update({"is_verified": True})
    db.commit()
    
    return True
