import json
from huggingface_hub import InferenceClient

from models import TicketAnalysis
from config import logger, HF_API_TOKEN, HF_MODEL_ID
from exceptions import LLMAnalysisError


SYSTEM_PROMPT = """
You are an expert AI system specialized in classifying customer support tickets.

Your task is to analyze a support ticket and return a STRICT JSON object that follows EXACTLY this schema:

{
  "category": "Técnico | Facturación | Comercial",
  "sentiment": "Positivo | Neutral | Negativo",
  "confidence": number between 0 and 1
}

Rules:
- Use ONLY the allowed values for category and sentiment.
- Do NOT include any extra fields.
- Do NOT include explanations, comments, or text outside the JSON.
- The output MUST be valid JSON that can be parsed by a machine.

Category definitions:
- Técnico: system errors, bugs, crashes, connection issues, access problems, app not working, performance issues.
- Facturación: payments, invoices, charges, refunds, pricing, subscriptions, billing issues.
- Comercial: product information, sales inquiries, quotes, plans, demos, general questions about services.

Sentiment definitions:
- Negativo: complaints, frustration, anger, urgency, dissatisfaction, strong negative emotion.
- Positivo: gratitude, satisfaction, praise, positive feedback.
- Neutral: informational, no clear emotion.

Confidence scale:
- 0.9 - 1.0: very clear classification
- 0.7 - 0.89: clear but some ambiguity
- 0.5 - 0.69: ambiguous or weak signals
- Below 0.5: highly uncertain (avoid unless strictly necessary)
"""


def analyze_ticket(description: str) -> TicketAnalysis:
    logger.info(f"Analyzing ticket with LLM: {description[:50]}...")
    # Mensajes para API conversacional (chat)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Ticket:\n\"\"\"{description}\"\"\"\n\n"
                "Remember:\n"
                "- Output ONLY valid JSON.\n"
                "- No markdown.\n"
                "- No text outside JSON."
            ),
        },
    ]

    # Inicializamos el cliente de Hugging Face una vez por llamada
    try:
        client = InferenceClient(model=HF_MODEL_ID, token=HF_API_TOKEN)
        logger.info("Hugging Face client initialized")
    except Exception as e:
        logger.error(f"Failed to initialize HF client: {e}")
        raise LLMAnalysisError("Failed to initialize LLM client")

    try:
        completion = client.chat_completion(
            messages=messages,
            max_tokens=256,
            temperature=0.2,
        )
        raw_text = completion.choices[0].message["content"].strip()
        logger.info(f"Raw LLM output: {raw_text}")
    except Exception as e:
        logger.error(f"LLM request failed: {e}")
        raise LLMAnalysisError(f"LLM service returned an error: {e}")

    try:
        data = json.loads(raw_text)

        # Validación estricta de esquema
        if data.get("category") not in ["Técnico", "Facturación", "Comercial"]:
            raise ValueError("Invalid category value")

        if data.get("sentiment") not in ["Positivo", "Neutral", "Negativo"]:
            raise ValueError("Invalid sentiment value")

        confidence = float(data.get("confidence"))

        if not (0.0 <= confidence <= 1.0):
            raise ValueError("Confidence out of range")

        result = TicketAnalysis(
            category=data["category"],
            sentiment=data["sentiment"],
            confidence=round(confidence, 2)
        )

        logger.info(
            f"Analysis complete: {result.category}, {result.sentiment}, confidence={result.confidence}"
        )

        return result

    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"Invalid structured output from LLM: {raw_text}")
        raise LLMAnalysisError("LLM returned invalid structured JSON")
