import json
import requests
from io import BytesIO
import PIL.Image

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings

from .gemini_helper import generate_content_with_gemini

class GeminiAnalyzeDrinkView(APIView):
    """
    Endpoint for analyzing a drink image along with optional nutritional inputs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image_url = request.data.get("image_url")
        additional_inputs = request.data.get("additional_inputs", {})
        additional_notes = request.data.get("additional_notes", "")
        
        if not image_url:
            return Response({"error": "Image URL is required for analysis."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Download the image from the provided URL.
        try:
            image_response = requests.get(image_url)
            image = PIL.Image.open(BytesIO(image_response.content))
        except Exception as e:
            return Response({"error": f"Error processing image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Build a prompt for Gemini using the image (if applicable) and additional data.
        prompt = (
            "I will send you an image of a drink. "
            "Return a JSON object with nutritional details including the estimated amount of caffeine and sugar. "
            "If you cannot determine details from the image, estimate them based on known drink data. "
            f"Additional notes: {additional_notes}. "
            f"Optional inputs: {json.dumps(additional_inputs)}"
        )
        
        try:
            gemini_response = generate_content_with_gemini(
                api_key=settings.GEMINI_API_KEY,
                model="gemini-2.0-flash",
                contents=[prompt, image]
            )
            response_text = gemini_response.text
        except Exception as e:
            return Response({"error": f"Gemini API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            parsed_response = json.loads(response_text)
        except Exception:
            parsed_response = {"raw_response": response_text}
        
        return Response(parsed_response, status=status.HTTP_200_OK)

class GeminiChatView(APIView):
    """
    Endpoint for text-based chat responses from Gemini.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_input = request.data.get("message", "")
        if not user_input:
            return Response({"error": "Message field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"User says: {user_input}\nProvide a helpful and personalized response regarding caffeine intake and wellness."
        
        try:
            gemini_response = generate_content_with_gemini(
                api_key=settings.GEMINI_API_KEY,
                model="gemini-2.0-flash",
                contents=[prompt]
            )
            response_text = gemini_response.text
        except Exception as e:
            return Response({"error": f"Gemini API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"response": response_text}, status=status.HTTP_200_OK)
