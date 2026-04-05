"""
Script pentru generarea cheilor secrete pentru production.
Ruleaza: python generate_keys.py
"""

import secrets
import base64


def generate_secret_key():
    """Generate a secure SECRET_KEY for JWT."""
    return secrets.token_urlsafe(48)


def generate_encryption_key():
    """Generate a 32-byte encryption key for AES-256."""
    key = secrets.token_bytes(32)
    return base64.urlsafe_b64encode(key).decode()


if __name__ == "__main__":
    print("=" * 60)
    print("GENERARE CHEI SECRETE PENTRU PRODUCTION")
    print("=" * 60)
    print()
    
    print("# Copiaza aceste valori in Railway Environment Variables:")
    print()
    print("SECRET_KEY=")
    print(generate_secret_key())
    print()
    print("ENCRYPTION_KEY=")
    print(generate_encryption_key())
    print()
    print("=" * 60)
    print("IMPORTANT: Pastreaza aceste chei IN SIGURANTA!")
    print("Nu le commita in Git si nu le impartasi cu nimeni!")
    print("=" * 60)
