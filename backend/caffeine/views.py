from rest_framework import generics, permissions
from rest_framework.views import APIView
from .models import CaffeineLog
from .serializers import CaffeineLogSerializer, CaffeineOverTimeSerializer
from datetime import datetime, timedelta
from rest_framework.response import Response
from django.utils.timezone import now

# Create Caffeine Log
class CaffeineLogCreateAPIView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineLogSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, confirmed=True)

# List All Caffeine Logs for the Authenticated User
class CaffeineLogListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineLogSerializer

    def get_queryset(self):
        queryset = CaffeineLog.objects.filter(user=self.request.user).order_by('-created_at')
        return queryset  # Simply return queryset without throwing an error

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response([], status=200)  # Return an empty list when there are no logs
        return super().list(request, *args, **kwargs)

# Retrieve a Single Caffeine Log by ID
class CaffeineLogDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineLogSerializer

    def get_queryset(self):
        return CaffeineLog.objects.filter(user=self.request.user)

# Caffeine Over Time API View - Ensures no error for empty logs
class CaffeineOverTimeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user  
        caffeine_logs = CaffeineLog.objects.filter(user=user).order_by("created_at")

        if not caffeine_logs.exists():
            return Response([], status=200)  # Return an empty list for consistency

        consumption_events = [
            {"date": log.created_at.isoformat(), "caffeine_mg": log.caffeine_mg}
            for log in caffeine_logs
        ]

        return Response(consumption_events, status=200)
        
