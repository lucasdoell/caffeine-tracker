from django.urls import path
from .views import CaffeineLogCreateAPIView

urlpatterns = [
    path('logs/', CaffeineLogCreateAPIView.as_view(), name='caffeine-log-create'),
]