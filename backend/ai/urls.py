from django.urls import path
from .views import SubmitDrinkAPIView, GeminiChatView

urlpatterns = [
    path('submit-drink/', SubmitDrinkAPIView.as_view(), name='submit-drink'),
    path('chat/', GeminiChatView.as_view(), name='gemini-chat'),
]
