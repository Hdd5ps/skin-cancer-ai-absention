"""
Security module for DermaScan AI backend.
Handles authentication, rate limiting, and secure error handling.
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import JWTError, jwt
from passlib.context import CryptContext

# Load environment variables from .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, that's fine

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Rate limiting configuration
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "50"))  # Stricter default for production
RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "3600"))  # 1 hour default

# Environment detection
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"

# ---------------------------------------------------------------------------
# Security Utilities
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = security) -> dict:
    """Dependency to get the current authenticated user from token."""
    token = credentials.credentials
    payload = verify_token(token)
    
    # You can add additional user validation here
    # For now, we just return the payload
    return payload


def secure_error_message(detail: str, is_production: bool = IS_PRODUCTION) -> str:
    """
    Return safe error messages based on environment.
    In production, return generic messages to avoid information disclosure.
    """
    if is_production:
        return "An error occurred. Please try again later."
    return detail


def sanitize_error_response(error: Exception, is_production: bool = IS_PRODUCTION) -> dict:
    """
    Create a sanitized error response.
    In production, hide sensitive details.
    """
    if is_production:
        return {
            "detail": "An error occurred. Please try again later.",
            "error_code": "INTERNAL_ERROR"
        }
    
    # In development, include more details for debugging
    return {
        "detail": str(error),
        "error_type": type(error).__name__,
        "error_code": "INTERNAL_ERROR"
    }


# Simple API key validation (for basic protection)
def validate_api_key(api_key: Optional[str]) -> bool:
    """
    Validate an API key against environment configuration.
    For production, you should implement proper key management.
    """
    if not api_key:
        return False
    
    valid_keys = os.getenv("API_KEYS", "").split(",")
    return api_key in valid_keys or api_key == os.getenv("API_KEY")


async def require_api_key(request: Request) -> None:
    """
    Dependency to require API key authentication.
    Can be used as an alternative to JWT for simpler setups.
    """
    api_key = request.headers.get("X-API-Key")
    if not validate_api_key(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )