from rest_framework import generics, permissions
from .models import CaffeineLog
from .serializers import CaffeineLogSerializer, CaffeineOverTimeSerializer
from datetime import datetime, timedelta
from rest_framework.response import Response

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
        if not queryset.exists():
            print(f"=== [DEBUG] No caffeine logs found for user {self.request.user} ===")
        return queryset

# Retrieve a Single Caffeine Log by ID
class CaffeineLogDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineLogSerializer

    def get_queryset(self):
        return CaffeineLog.objects.filter(user=self.request.user)
    
class CaffeineOverTimeAPIView(generics.ListAPIView):
    """
    Returns caffeine remaining over time for a user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineOverTimeSerializer

    def get_queryset(self):
        user = self.request.user
        logs = CaffeineLog.objects.filter(user=user).order_by("created_at")
        return logs

    def list(self, request, *args, **kwargs):
        user = request.user
        caffeine_logs = CaffeineLog.objects.filter(user=user).order_by("created_at")

        half_life_hours = 5  # Average caffeine half-life
        caffeine_decay = []

        # Process each caffeine log to compute decay over time
        for log in caffeine_logs:
            initial_caffeine = log.caffeine_mg
            timestamp = log.created_at

            # Generate decay data points for 24 hours (every 1 hour)
            for hour in range(0, 24 + 1):  
                decay_time = timestamp + timedelta(hours=hour)
                caffeine_remaining = initial_caffeine * (0.5 ** (hour / half_life_hours))

                caffeine_decay.append({
                    "date": decay_time.isoformat(),
                    "caffeine_remaining_mg": round(caffeine_remaining, 2)
                })

        return Response(caffeine_decay, status=200)
