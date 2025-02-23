from google import genai
from google.genai import types
import PIL.Image

def generate_content_with_gemini(api_key, model, contents):
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model,
        contents=contents
    )
    return response
