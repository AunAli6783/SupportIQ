from fastapi import APIRouter
from app.api.v1.endpoints import chat, ingest

api_router = APIRouter()

api_router.include_router(chat.router)
api_router.include_router(ingest.router)
