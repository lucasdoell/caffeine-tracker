from django.urls import path
from .views import CaffeineLogCreateAPIView, CaffeineLogListAPIView, CaffeineLogDetailAPIView

urlpatterns = [
    path('logs/', CaffeineLogListAPIView.as_view(), name='caffeine-log-list'),  # List all logs
    path('logs/create/', CaffeineLogCreateAPIView.as_view(), name='caffeine-log-create'),  # Create log
    path('logs/<int:pk>/', CaffeineLogDetailAPIView.as_view(), name='caffeine-log-detail'),  # Retrieve single log
]

