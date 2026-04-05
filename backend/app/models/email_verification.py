from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class EmailVerification(Base):
    """Coduri de verificare email."""
    __tablename__ = "email_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Cod de 6 cifre
    code = Column(String(6), nullable=False)
    
    # Status
    is_verified = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)  # Număr încercări
    
    # Expirare (15 minute)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="email_verifications")
