import base64
import json
import os
import re
from openai import OpenAI
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Read OpenAI key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY is missing in the environment variables!")

client = OpenAI(api_key=OPENAI_API_KEY)

def safe_extract_json_from_text(text: str):
    """
    Extract JSON from text that may include markdown code blocks or extra explanation.
    """
    if not text or not isinstance(text, str):
        raise ValueError("Empty text")

    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.I)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.I).strip()

    # Extract first { ... last }
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start:end+1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            # Attempt minimal cleanup
            candidate_fixed = re.sub(r",\s*}", "}", candidate)
            candidate_fixed = re.sub(r",\s*]", "]", candidate_fixed)
            return json.loads(candidate_fixed)

    # Last fallback:
    return json.loads(cleaned)

def analyze_front_id(image_bytes: bytes, current_date_for_ai: str):
    """
    FRONT-SIDE-ONLY detailed ID verification.
    Uses your exact prompts (rewritten for front-side-only).
    """

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    # ---------------- SYSTEM PROMPT (FRONT SIDE ONLY) ----------------
    system_prompt = """
You are an ID forgery and document verification expert. Your task is to analyze ID card images and extract key information.

You will analyze ONLY the front side of the ID card. There is no backside image and no live face image provided.

Return ONLY a valid JSON object. Ensure all 'overall_status' and 'sub_checks' values are prefixed with 'PASSED:' or 'FAILED:'.

{
   "verdict": "ORIGINAL ID CARD - NO ISSUE DETECTED" or "FAKE ID CARD",
   "analysis_details": {
     "Text_Format_and_Field_Validation": {
       "overall_status": "PASSED" or "FAILED",
       "summary": "Overall assessment for text format and field validation.",
       "sub_checks": {
         "Field_Presence_and_Format": "PASSED: ..." or "FAILED: ...",
         "Country_Name_Presence": "PASSED: ..." or "FAILED: ...",
         "Expiry_Date_Status": "PASSED: ..." or "FAILED: ...",
         "Spelling_Consistency": "PASSED: ..." or "FAILED: ..."
       }
     },
     "Visual_Inspection": {
       "overall_status": "PASSED" or "FAILED",
       "summary": "Overall assessment for visual inspection.",
       "sub_checks": {
         "Tampering_Detection": "PASSED: ..." or "FAILED: ...",
         "Lighting_and_Quality": "PASSED: ..." or "FAILED: ...",
         "Standard_Format_Compliance": "PASSED: ..." or "FAILED: ..."
       }
     },
     "Security_Features": {
       "overall_status": "PASSED" or "FAILED",
       "summary": "Assessment of visible front-side security features.",
       "sub_checks": {
         "Feature_Presence": "PASSED: ..." or "FAILED: ...",
         "Feature_Authenticity": "PASSED: ..." or "FAILED: ..."
       }
     }
   },
   "parsed_id_data": {
     "Name": "String",
     "Dob": "String (DD/MM/YYYY)",
     "Gender": "String (M/F/Other)",
     "Address": "String",
     "Id_number": "String",
     "Nationality": "String",
     "Expiry_date": "String (DD/MM/YYYY or N/A)"
   },
   "raw_ocr_text": {
     "Front Side": "[All raw text from front image]",
     "Back Side": "N/A"
   },
   "biometric_face_match": "N/A: No face image provided",
   "summary": "Overall assessment of the ID card in two to three sentences."
}

DO NOT include any extra text, comments, or explanations outside the JSON object. Just return the JSON object.
"""

    # ---------------- USER PROMPT (FRONT SIDE ONLY) ----------------
    user_prompt = f"""
You are an AI system for verifying the authenticity of government-issued ID cards.

You are given ONLY the front side of an ID card (no back side, no live face). Analyze the front image thoroughly.

First, parse the following key data fields from the ID card. If a field is not present, mark it as "N/A":
  - Name
  - Dob (DD/MM/YYYY)
  - Gender
  - Address
  - Id number
  - Nationality
  - Expiry date

Next, extract all raw visible text from the front side of the ID.
Mark the back-side OCR text as: "N/A"

Since no live face image is provided, set:
biometric_face_match = "N/A: No face detected"

The current date is: {current_date_for_ai}.
When evaluating the 'Expiry date', compare it against this date. it should be above or equal to this date to be valid.

Perform all checks (text format, spelling, tampering, lighting, compliance, security features).

you have to check the name it should be meaningful not some id merit sample text like thaat and you should check the dob is also valid not some00/00/0000 if such thinggs happen make text validation failed.
Return ONLY a valid JSON response.
"""

    # ---------------- OpenAI CALL ----------------
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}}
                ],
            },
        ],
        max_tokens=1800,
    )

    raw_message = response.choices[0].message.content


    try:
        parsed = safe_extract_json_from_text(raw_message)
        return parsed
    except Exception as e:
        return {
            "verdict": "FAKE ID CARD",
            "analysis_details": {},
            "parsed_id_data": {},
            "raw_ocr_text": {"Front Side": ""},
            "biometric_face_match": "N/A",
            "summary": "AI returned unstructured output.",
            "raw_json_error": raw_message,
            "parse_error": str(e),
        }
