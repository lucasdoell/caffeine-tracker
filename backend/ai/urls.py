from django.urls import path
from .views import GeminiAnalyzeDrinkView, GeminiChatView

urlpatterns = [
    path('analyze-drink/', GeminiAnalyzeDrinkView.as_view(), name='gemini-analyze-drink'),
    path('chat/', GeminiChatView.as_view(), name='gemini-chat'),
]
