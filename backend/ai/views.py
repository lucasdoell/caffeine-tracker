import json
import requests
from io import BytesIO
import PIL.Image
from caffeine.models import CaffeineLog
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, parsers
from django.conf import settings
from botocore.config import Config
import boto3

from .gemini_helper import generate_content_with_gemini

class SubmitDrinkAPIView(APIView):
    """
    This endpoint handles a multipart/form-data POST request containing:
      - An image file ("image")
      - Optional additional inputs (beverage_size_ml, sugar_content_g, calories_kcal)
      - additional_notes (free text)

    Instead of relying on the default_storage or S3Boto3Storage,
    we explicitly upload the file to R2 via boto3, verify the upload,
    and construct the final public URL. Then we pass this URL to Gemini for analysis.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        # 1. Debug: Print the relevant storage configuration from settings
        print("=== [DEBUG] STORAGE CONFIGURATION (SETTINGS) ===")
        print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
        print(f"INSTALLED_APPS: {settings.INSTALLED_APPS}")
        print(f"AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}")
        print(f"AWS_S3_ENDPOINT_URL: {settings.AWS_S3_ENDPOINT_URL}")
        print(f"AWS_S3_CUSTOM_DOMAIN: {settings.AWS_S3_CUSTOM_DOMAIN}")
        
        # 2. Retrieve the image from the request
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"error": "Image file is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"=== [DEBUG] Received image: {image_file.name}, "
              f"content_type={image_file.content_type}, size={image_file.size} bytes ===")

        # 3. Create a direct boto3 S3 client for Cloudflare R2
        try:
            s3 = boto3.client(
                's3',
                endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                config=Config(signature_version='s3v4')
            )
            print("=== [DEBUG] Successfully created S3 client for R2 ===")
        except Exception as e:
            print(f"=== [DEBUG] Failed to create S3 client: {str(e)} ===")
            return Response({"error": f"Cannot create S3 client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Upload the file directly using boto3
        file_key = f"uploads/caffeine_drinks/{image_file.name}"
        try:
            print(f"=== [DEBUG] Attempting direct upload to R2 with key: {file_key} ===")
            s3.upload_fileobj(
                image_file,
                settings.AWS_STORAGE_BUCKET_NAME,
                file_key,
                ExtraArgs={'ACL': 'public-read'}
            )
            print("=== [DEBUG] Upload succeeded (boto3.upload_fileobj) ===")
        except Exception as e:
            print(f"=== [DEBUG] Upload error: {str(e)} ===")
            return Response({"error": f"Failed to upload file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 5. Verify the object exists in R2
        try:
            s3.head_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=file_key)
            print(f"=== [DEBUG] File verified in R2: {file_key} ===")
        except Exception as e:
            print(f"=== [DEBUG] File not found in R2 after upload: {str(e)} ===")

        # 6. Construct the public URL using your custom domain
        # e.g. https://r2.lucasdoell.dev/uploads/caffeine_drinks/<filename>
        image_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{file_key}"
        print(f"=== [DEBUG] Constructed image_url: {image_url} ===")

        # 7. Test URL accessibility (HEAD request)
        try:
            head_resp = requests.head(image_url)
            print(f"=== [DEBUG] URL HEAD status: {head_resp.status_code}, length={head_resp.headers.get('Content-Length')} ===")
        except Exception as e:
            print(f"=== [DEBUG] HEAD request to {image_url} failed: {str(e)} ===")

        # 8. Collect additional inputs for AI analysis
        additional_inputs = {
            "beverage_size_ml": request.data.get("beverage_size_ml"),
            "sugar_content_g": request.data.get("sugar_content_g"),
            "calories_kcal": request.data.get("calories_kcal")
        }
        # Filter out None values
        additional_inputs = {k: v for k, v in additional_inputs.items() if v is not None}
        additional_notes = request.data.get("additional_notes", "")

        print(f"=== [DEBUG] Additional inputs: {additional_inputs} ===")
        print(f"=== [DEBUG] Additional notes: {additional_notes} ===")

        # 9. Construct a prompt for Gemini that references the image_url
        # Constructing a strict JSON-enforced prompt for Gemini
        prompt = (
            "You will analyze an image of a drink and return a **strictly formatted JSON object** with its nutritional details. "
            "Ensure that the response is **always** in **valid JSON** format, without any additional text, comments, or explanations. "
            "Use **exact numerical values** (avoid ranges like '140-160mg'; always provide a single number). "
            "Units should be included where applicable (e.g., mg, g, fl oz). **Follow this format strictly:**\n\n"
            "{\n"
            "  \"beverage_name\": \"Monster Energy Zero Ultra\",\n"
            "  \"serving_size\": \"16 fl oz (473ml)\",\n"
            "  \"calories\": 10,\n"
            "  \"total_fat_g\": 0,\n"
            "  \"sodium_mg\": 200,\n"
            "  \"total_carbohydrates_g\": 3,\n"
            "  \"sugars_g\": 0,\n"
            "  \"added_sugars_g\": 0,\n"
            "  \"protein_g\": 0,\n"
            "  \"caffeine_mg\": 140,\n"
            "  \"taurine_mg\": 1000,\n"
            "  \"b_vitamins\": {\n"
            "    \"vitamin_b3_mg\": 20,\n"
            "    \"vitamin_b6_mg\": 5,\n"
            "    \"vitamin_b12_mcg\": 3\n"
            "  },\n"
            "  \"other_ingredients\": {\n"
            "    \"carbonated_water\": true,\n"
            "    \"natural_flavors\": true,\n"
            "    \"sucralose\": true\n"
            "  },\n"
            "  \"other_notes\": \"Zero Sugar, Carbonated\"\n"
            "}\n\n"
            "If any value is missing, estimate it based on similar drinks. Ensure **all keys are present**."
            f"Additional inputs: {json.dumps(additional_inputs)}. "
            f"Additional notes: {additional_notes}. "
            f"Image URL: {image_url}."
        )

        print(f"=== [DEBUG] Constructed prompt for Gemini:\n{prompt} ===")

        # 10. Download the image from the constructed URL (only if needed by Gemini)
        try:
            dl_resp = requests.get(image_url)
            print(f"=== [DEBUG] Downloaded image from {image_url}, status_code={dl_resp.status_code}, length={len(dl_resp.content)} bytes ===")
            if dl_resp.status_code != 200:
                return Response({"error": f"Image not accessible at {image_url} (status {dl_resp.status_code})"}, status=status.HTTP_400_BAD_REQUEST)
            image = PIL.Image.open(BytesIO(dl_resp.content))
            print("=== [DEBUG] PIL recognized the image ===")
        except Exception as e:
            print(f"=== [DEBUG] Error processing downloaded image: {str(e)} ===")
            return Response({"error": f"Error processing downloaded image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # 11. Call Gemini for AI analysis
        try:
            gemini_response = generate_content_with_gemini(
                api_key=settings.GEMINI_API_KEY,
                model="gemini-2.0-flash",
                contents=[prompt, image]
            )
            response_text = gemini_response.text
            print(f"=== [DEBUG] Gemini response text:\n{response_text} ===")
        except Exception as e:
            print(f"=== [DEBUG] Gemini API error: {e} ===")
            return Response({"error": f"Gemini API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 12. Parse the AI response
        try:
            parsed_response = json.loads(response_text)
            print("=== [DEBUG] Parsed Gemini response as JSON successfully ===")
        except Exception:
            parsed_response = {"raw_response": response_text}
            print("=== [DEBUG] Failed to parse JSON; returning raw response ===")

        # 13. Return the final results
        final_response = {
            "image_url": image_url,
            "analysis": parsed_response
        }
        print(f"=== [DEBUG] Final response:\n{final_response} ===")

        return Response(final_response, status=status.HTTP_200_OK)



class GeminiChatView(APIView):
    """
    Endpoint for text-based chat responses from Gemini, with user data context.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_input = request.data.get("message", "")
        if not user_input:
            return Response({"error": "Message field is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch user logs
        logs = CaffeineLog.objects.filter(user=request.user).order_by("-created_at")

        # 2. Format logs as a string
        if logs.exists():
            formatted_logs = []
            for log in logs:
                date_str = log.created_at.strftime("%b %d %Y, %I:%M %p")
                beverage = log.beverage_name or "Unknown drink"
                mg = f"{int(log.caffeine_mg)} mg"
                formatted_logs.append(f"{date_str} | {mg} from '{beverage}'")
            logs_text = "\n".join(formatted_logs)
        else:
            logs_text = "No caffeine logs recorded."

        # 3. Build prompt
        prompt = (
            "You have the following caffeine logs for the user:\n\n"
            f"{logs_text}\n\n"
            "Now, the user says:\n"
            f"{user_input}\n\n"
            "Provide a helpful, personalized response about caffeine intake and wellness."
        )

        # 4. Call Gemini
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
