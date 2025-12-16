from typing import Optional, List, Dict
from sqlalchemy.orm import Session, joinedload
from openai import AsyncOpenAI
from langdetect import detect, LangDetectException
from app.core.config import settings
from app.models import Kid, Record, SleepRecord, HealthRecord, GrowthRecord


class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def get_system_prompt(
        self,
        ai_mode: str,
        kid_context: Optional[str] = None,
        rag_context: Optional[str] = None,
        language_code: str = "ko",
    ) -> str:
        # Korean prompts
        base_prompts_ko = {
            "doctor": (
                "당신은 소아과 상담 AI입니다.\n"
                "- 영유아 건강 증상/관리 상담 시 의학적 근거를 바탕으로 구체적이고 신중하게 답변합니다.\n"
                "- 긴급 증상(호흡곤란, 의식저하, 지속 고열 등)이 의심되면 즉시 가까운 응급실 방문을 권고합니다.\n"
                "- 검진/치료/약물은 반드시 의료진 판단이 필요하다고 안내합니다.\n"
                "- 가능한 경우 연령·체중·발달 단계에 맞춘 권장사항과 주의사항을 함께 제공합니다."
            ),
            "mom": (
                "당신은 육아 전반을 돕는 AI입니다.\n"
                "- 수면, 발달, 생활습관, 위생, 놀이 등 실생활 질문에 대해 신뢰할 수 있는 자료를 바탕으로 답변합니다.\n"
                "- 연령별 발달 단계와 부모의 현실적 제약을 고려해 실천 가능한 조언을 제시합니다.\n"
                "- 필요 시 전문가 상담(소아과, 발달센터 등)을 안내합니다."
            ),
            "nutritionist": (
                "당신은 영유아 영양 코치 AI입니다.\n"
                "- 연령·체중·발달 단계에 맞춘 식단과 조리/보관 위생 가이드를 제공합니다.\n"
                "- 식품 알레르기, 질식 위험 식품, 위생 관리에 대한 주의사항을 명확히 안내합니다.\n"
                "- 가능하면 조리법, 대체 식품, 하루 섭취 예시를 함께 제공합니다."
            ),
        }

        # English prompts (for non-Korean languages)
        base_prompts_en = {
            "doctor": (
                "You are a pediatric consultation AI.\n"
                "- Provide specific and careful answers based on medical evidence when consulting on infant/toddler health symptoms and care.\n"
                "- If emergency symptoms (difficulty breathing, loss of consciousness, persistent high fever, etc.) are suspected, immediately recommend visiting the nearest emergency room.\n"
                "- Always advise that examinations, treatments, and medications require a medical professional's judgment.\n"
                "- When possible, provide age, weight, and developmental stage-appropriate recommendations along with precautions."
            ),
            "mom": (
                "You are a parenting assistance AI.\n"
                "- Answer real-life questions about sleep, development, lifestyle habits, hygiene, and play based on reliable sources.\n"
                "- Provide practical advice considering developmental stages by age and parents' realistic constraints.\n"
                "- When necessary, recommend professional consultation (pediatrician, developmental center, etc.)."
            ),
            "nutritionist": (
                "You are an infant/toddler nutrition coach AI.\n"
                "- Provide meal plans and cooking/storage hygiene guides tailored to age, weight, and developmental stage.\n"
                "- Clearly advise on food allergies, choking hazard foods, and hygiene management precautions.\n"
                "- When possible, provide recipes, food alternatives, and daily intake examples."
            ),
        }

        # Select prompt based on language
        if language_code.lower() == "ko":
            base_prompts = base_prompts_ko
        else:
            base_prompts = base_prompts_en

        system_prompt = base_prompts.get(ai_mode, base_prompts["mom"])

        if kid_context:
            if language_code.lower() == "ko":
                system_prompt += f"\n\n[아이 정보]\n{kid_context}"
            else:
                system_prompt += f"\n\n[Child Information]\n{kid_context}"

        if rag_context:
            if language_code.lower() == "ko":
                system_prompt += f"\n\n[참고 근거]\n{rag_context}"
            else:
                system_prompt += f"\n\n[Reference]\n{rag_context}"

        system_prompt += self._build_language_guidelines(language_code)

        return system_prompt

    def build_kid_context(self, kid: Kid, db: Session, language_code: str = "ko") -> str:
        """Assemble recent kid info for grounding."""
        is_korean = language_code.lower() == "ko"

        if is_korean:
            context_parts = [f"- 이름: {kid.name}"]
            context_parts.append(f"- 생년월일: {kid.birth_date}")
            context_parts.append(f"- 성별: {'남아' if kid.gender == 'male' else '여아'}")
        else:
            context_parts = [f"- Name: {kid.name}"]
            context_parts.append(f"- Birth date: {kid.birth_date}")
            context_parts.append(f"- Gender: {'Boy' if kid.gender == 'male' else 'Girl'}")

        recent_growth = (
            db.query(GrowthRecord)
            .join(Record)
            .filter(Record.kid_id == kid.id)
            .options(joinedload(GrowthRecord.record))
            .order_by(Record.created_at.desc())
            .first()
        )
        if recent_growth:
            if recent_growth.height_cm:
                if is_korean:
                    context_parts.append(f"- 최근 키: {recent_growth.height_cm}cm")
                else:
                    context_parts.append(f"- Recent height: {recent_growth.height_cm}cm")
            if recent_growth.weight_kg:
                if is_korean:
                    context_parts.append(f"- 최근 체중: {recent_growth.weight_kg}kg")
                else:
                    context_parts.append(f"- Recent weight: {recent_growth.weight_kg}kg")

        recent_health = (
            db.query(HealthRecord)
            .join(Record)
            .filter(Record.kid_id == kid.id)
            .options(joinedload(HealthRecord.record))
            .order_by(Record.created_at.desc())
            .limit(3)
            .all()
        )
        if recent_health:
            symptoms = []
            for health_record in recent_health:
                if health_record.symptom:
                    symptoms.append(health_record.symptom.value)
            if symptoms:
                if is_korean:
                    context_parts.append(f"- 최근 증상: {', '.join(set(symptoms))}")
                else:
                    context_parts.append(f"- Recent symptoms: {', '.join(set(symptoms))}")

        recent_sleep = (
            db.query(SleepRecord)
            .join(Record)
            .filter(Record.kid_id == kid.id)
            .options(joinedload(SleepRecord.record))
            .order_by(Record.created_at.desc())
            .limit(7)
            .all()
        )
        if recent_sleep:
            total_hours = 0
            for sleep_record in recent_sleep:
                duration = (sleep_record.end_datetime - sleep_record.start_datetime).total_seconds() / 3600
                total_hours += duration
            avg_sleep = total_hours / len(recent_sleep)
            if is_korean:
                context_parts.append(f"- 최근 평균 수면시간: {avg_sleep:.1f}시간")
            else:
                context_parts.append(f"- Recent average sleep: {avg_sleep:.1f} hours")

        return "\n".join(context_parts)

    def detect_language(self, text: str) -> str:
        cleaned = text.strip()
        if not cleaned:
            return "ko"
        try:
            return detect(cleaned)
        except LangDetectException:
            if any("가" <= char <= "힣" for char in cleaned):
                return "ko"
            return "en"

    def _language_label(self, language_code: str) -> str:
        mapping = {
            "ko": "Korean honorific speech",
            "en": "English",
            "ja": "Japanese",
            "zh-cn": "Chinese",
            "zh-tw": "Chinese",
            "es": "Spanish",
            "fr": "French",
        }
        return mapping.get(language_code.lower(), language_code.upper())

    def _build_language_guidelines(self, language_code: str) -> str:
        if language_code.lower() == "ko":
            return (
                "\n\n원칙:\n"
                "- 근거가 부족하거나 위험 요소가 있으면 전문가 방문을 권고합니다.\n"
                "- 진단이나 처방을 단정하지 말고, 증상 악화 시 즉시 병원 방문을 안내합니다.\n"
                "- 모든 답변은 한국어 존댓말로 짧고 명확하게 작성합니다."
            )

        language_label = self._language_label(language_code)
        return (
            "\n\nGuidelines:\n"
            "- Provide evidence-based and practical guidance for caregivers.\n"
            "- If an emergency is suspected, clearly recommend visiting the nearest emergency room.\n"
            "- Remind users that diagnoses or prescriptions must be confirmed by medical professionals.\n"
            f"- Respond in {language_label} (the same language as the user's latest question) with a warm, respectful tone."
        )

    async def generate_response(
        self,
        message: str,
        ai_mode: str,
        conversation_history: List[Dict[str, str]],
        kid: Optional[Kid] = None,
        db: Optional[Session] = None,
        rag_context: Optional[str] = None,
    ) -> str:
        if not self.client:
            return "AI 서비스가 설정되지 않았습니다. 관리자에게 문의해 주세요."

        # Detect language first
        language_code = self.detect_language(message)

        kid_context = None
        if kid and db:
            kid_context = self.build_kid_context(kid, db, language_code)

        system_prompt = self.get_system_prompt(ai_mode, kid_context, rag_context, language_code)

        messages = [{"role": "system", "content": system_prompt}]

        for msg in conversation_history:
            role = "user" if msg["sender"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["message"]})

        messages.append({"role": "user", "content": message})

        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.2,
                top_p=0.9,
                max_tokens=800,
            )
            content = response.choices[0].message.content if response.choices else None
            return content.strip() if content else "응답을 생성하지 못했습니다."
        except Exception as e:
            return f"죄송합니다. 응답을 생성하는 과정에서 문제가 발생했습니다: {str(e)}"


# Singleton instance
ai_service = AIService()
