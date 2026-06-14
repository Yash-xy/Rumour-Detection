"""SQLAlchemy ORM models."""

import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_admin = Column(Boolean, default=False)


class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    verdict = Column(String)
    confidence = Column(Integer)
    scheme = Column(String, nullable=True)
    similarity = Column(Float, nullable=True)
    level = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    related_schemes_json = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    status = Column(String, nullable=True)
    sentiment = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref="history_items")
