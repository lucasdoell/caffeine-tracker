from django.urls import path
from .views import CaffeineLogCreateAPIView

urlpatterns = [
    # Endpoint for final submission of the caffeine log after user confirmation
    path('logs/', CaffeineLogCreateAPIView.as_view(), name='caffeine-log-create'),
]
