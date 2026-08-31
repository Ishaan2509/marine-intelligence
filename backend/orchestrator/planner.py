import os

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel

load_dotenv()


class UserQuery(BaseModel):
    intent: str
    location: str | None
    time_period: str | None


api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)


def plan_query(message: str) -> UserQuery:
    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=f"""
You are the planning component of a marine intelligence platform.

Analyze the user's query and extract:

1. intent
2. location
3. time period

The intent should describe what the user is trying to accomplish.

Examples of intents:
- safety_check
- pfz_lookup
- weather_query
- marine_conditions
- route_planning
- hazard_alert
- general_marine_query

If the user does not provide a location or time period, return null.

User query:
{message}
""",
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": UserQuery.model_json_schema(),
        },
    )

    return UserQuery.model_validate_json(interaction.output_text)