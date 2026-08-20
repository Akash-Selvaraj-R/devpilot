import json
import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProvider:
    def __init__(self) -> None:
        self.api_key = settings.AI_API_KEY
        self.base_url = settings.AI_BASE_URL.rstrip("/")
        self.model = settings.AI_MODEL

    async def chat(self, messages: list[dict[str, str]], system_prompt: str | None = None) -> str:
        if not self.api_key:
            raise AIServiceError("AI API key not configured. Set AI_API_KEY in .env")

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
        }

        if system_prompt:
            payload["messages"] = [{"role": "system", "content": system_prompt}] + messages

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            logger.error("AI API HTTP error: %s - %s", e.response.status_code, e.response.text)
            raise AIServiceError(f"AI API returned {e.response.status_code}: {e.response.text}") from e
        except httpx.RequestError as e:
            logger.error("AI API connection error: %s", str(e))
            raise AIServiceError(f"Failed to connect to AI API: {str(e)}") from e
        except (KeyError, IndexError) as e:
            logger.error("Unexpected AI API response format: %s", str(e))
            raise AIServiceError("Unexpected response format from AI API") from e

    async def chat_json(self, messages: list[dict[str, str]], system_prompt: str | None = None) -> dict:
        raw = await self.chat(messages, system_prompt)
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                cleaned = "\n".join(lines)
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse AI response as JSON: %s", raw[:500])
            raise AIServiceError(f"AI response is not valid JSON: {str(e)}") from e


class AIServiceError(Exception):
    pass
