from django.urls import path
from .views import EnergyLogListCreateAPIView, EnergyLogRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('logs/', EnergyLogListCreateAPIView.as_view(), name='energy-log-list-create'),
    path('logs/<uuid:pk>/', EnergyLogRetrieveUpdateDestroyAPIView.as_view(), name='energy-log-detail'),
]
