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

    # Get AI mode name - map directly from ai_mode_id as fallback
    ai_mode_map = {1: "doctor", 2: "mom", 3: "nutrition"}
    ai_mode_name = ai_mode_map.get(data.ai_mode_id, "mom") if data.ai_mode_id else "mom"

    # Try to get from DB if available (overrides fallback)
    if data.ai_mode_id:
        ai_mode = db.query(AIMode).filter(AIMode.id == data.ai_mode_id).first()
        if ai_mode:
            ai_mode_name = ai_mode.name.lower()
            if ai_mode_name in ("nutritionist", "nutrient", "nutri"):
                ai_mode_name = "nutrition"

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
