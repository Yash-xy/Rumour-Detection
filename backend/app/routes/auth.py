"""Authentication routes: /auth/register, /auth/login, /auth/logout."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.security import hash_password, verify_password, create_token, verify_token

router = APIRouter(prefix="/auth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_admin_user(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "is_admin", False) is not True:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token({"user_id": new_user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": new_user.name, "email": new_user.email, "id": new_user.id, "is_admin": new_user.is_admin},
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": db_user.name, "email": db_user.email, "id": db_user.id, "is_admin": db_user.is_admin},
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"name": current_user.name, "email": current_user.email, "id": current_user.id, "is_admin": current_user.is_admin}
