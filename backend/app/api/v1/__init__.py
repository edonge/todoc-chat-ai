from fastapi import APIRouter
from .auth import router as auth_router
from .kids import router as kids_router
from .records import router as records_router
from .chat import router as chat_router
from .community import router as community_router
from .files import router as files_router
from .daily_tips import router as daily_tips_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(kids_router)
api_router.include_router(records_router)
api_router.include_router(chat_router)
api_router.include_router(community_router)
api_router.include_router(files_router)
api_router.include_router(daily_tips_router)
