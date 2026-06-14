"""Pydantic request/response schemas."""

from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class HistoryOut(BaseModel):
    id: int
    text: str
    verdict: str
    confidence: int
