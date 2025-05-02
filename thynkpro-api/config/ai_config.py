import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
model_name = os.getenv("GOOGLE_MODEL")

if not api_key:
    raise ValueError("No GOOGLE_API_KEY found in environment variables.")

# Configure Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name)
