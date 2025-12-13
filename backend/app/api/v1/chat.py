import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.api.deps import get_db, get_current_user
from app.models import User, Kid, ChatSession, ChatMessage, AIMode, SenderTypeEnum
from app.schemas.chat import (
    ChatSessionCreate, ChatSessionResponse,
    ChatMessageCreate, ChatMessageResponse
)
from app.services.ai_service import ai_service
from app.rag.retriever import doctor_retriever
from app.rag.retriever_mom import mom_retriever
from app.rag.retriever_nutri import nutri_retriever
from app.rag.retriever_common import common_retriever

router = APIRouter(prefix="/chat", tags=["chat"])


def get_kid_or_404(kid_id: int, user_id: int, db: Session) -> Kid:
    kid = db.query(Kid).filter(Kid.id == kid_id, Kid.user_id == user_id).first()
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    return kid


@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    
    sessions = db.query(ChatSession).filter(
        ChatSession.kid_id == kid_id
    ).order_by(ChatSession.created_at.desc()).all()

    return sessions


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
def create_session(
    data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(data.kid_id, current_user.id, db)

    session = ChatSession(kid_id=data.kid_id)
    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).options(
        joinedload(ChatSession.messages),
        joinedload(ChatSession.kid)
    ).filter(ChatSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Verify ownership
    if session.kid.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return session


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).options(
        joinedload(ChatSession.kid)
    ).filter(ChatSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.kid.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(session)
    db.commit()


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: int,
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).options(
        joinedload(ChatSession.messages),
        joinedload(ChatSession.kid)
    ).filter(ChatSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.kid.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Save user message
    user_message = ChatMessage(
        session_id=session_id,
        sender=SenderTypeEnum.user,
        ai_mode_id=data.ai_mode_id,
        content=data.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Get AI mode name
    ai_mode_name = "mom"
    if data.ai_mode_id:
        ai_mode = db.query(AIMode).filter(AIMode.id == data.ai_mode_id).first()
        if ai_mode:
            ai_mode_name = ai_mode.name.lower()

    rag_context_parts = []
    if ai_mode_name == "doctor":
        try:
            rag_context_parts.append(await asyncio.to_thread(doctor_retriever.search, data.content))
        except Exception:
            pass
    elif ai_mode_name == "mom":
        try:
            rag_context_parts.append(await asyncio.to_thread(mom_retriever.search, data.content))
        except Exception:
            pass
    elif ai_mode_name in ("nutritionist", "nutrient", "nutri"):
        try:
            rag_context_parts.append(await asyncio.to_thread(nutri_retriever.search, data.content))
        except Exception:
            pass

    # Common retriever for all modes
    try:
        rag_context_parts.append(await asyncio.to_thread(common_retriever.search, data.content))
    except Exception:
        pass

    rag_context = "\n".join([c for c in rag_context_parts if c])

    # Build conversation history
    conversation_history = [
        {"sender": msg.sender.value, "message": msg.content}
        for msg in sorted(session.messages, key=lambda x: x.created_at)
    ]

    # Generate AI response
    ai_response_text = await ai_service.generate_response(
        message=data.content,
        ai_mode=ai_mode_name,
        conversation_history=conversation_history,
        kid=session.kid,
        db=db,
        rag_context=rag_context
    )

    # Save AI response
    ai_message = ChatMessage(
        session_id=session_id,
        sender=SenderTypeEnum.ai,
        ai_mode_id=data.ai_mode_id,
        content=ai_response_text
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    return ai_message
