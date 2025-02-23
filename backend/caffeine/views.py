from rest_framework import generics, permissions
from rest_framework.views import APIView
from .models import CaffeineLog
from .serializers import CaffeineLogSerializer, CaffeineOverTimeSerializer
from datetime import datetime, timedelta
from rest_framework.response import Response
from django.utils.timezone import now
import math

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
    
# class CaffeineOverTimeAPIView(APIView):
#     def get(self, request):
#         user = request.user  # Get the authenticated user
#         caffeine_logs = CaffeineLog.objects.filter(user=user).order_by("created_at")

#         if not caffeine_logs.exists():
#             return Response({"message": "No caffeine logs found."}, status=200)

#         half_life_hours = 5  # Caffeine half-life in hours
#         all_decay_points = {}

#         for log in caffeine_logs:
#             caffeine_amount = log.caffeine_mg
#             start_time = log.created_at

#             # Generate caffeine decay points
#             for hour in range(0, 24 * 2, 1):  # Track for 48 hours
#                 timestamp = start_time + timedelta(hours=hour)  # ✅ Fix: Use timedelta directly
#                 time_diff = (timestamp - start_time).total_seconds() / 3600  # Convert to hours
                
#                 # Calculate caffeine remaining
#                 remaining_caffeine = caffeine_amount * (0.5 ** (time_diff / half_life_hours))

#                 # Sum caffeine at overlapping times
#                 timestamp_str = timestamp.isoformat()
#                 if timestamp_str in all_decay_points:
#                     all_decay_points[timestamp_str] += remaining_caffeine
#                 else:
#                     all_decay_points[timestamp_str] = remaining_caffeine

#         # Convert to sorted list of {date, caffeine_remaining_mg}
#         decay_data = [
#             {"date": ts, "caffeine_remaining_mg": round(caffeine, 2)}
#             for ts, caffeine in sorted(all_decay_points.items())
#         ]

#         return Response(decay_data, status=200)

class CaffeineOverTimeAPIView(APIView):
    def get(self, request):
        user = request.user  
        caffeine_logs = CaffeineLog.objects.filter(user=user).order_by("created_at")

        if not caffeine_logs.exists():
            return Response({"message": "No caffeine logs found."}, status=200)

        consumption_events = [
            {"date": log.created_at.isoformat(), "caffeine_mg": log.caffeine_mg}
            for log in caffeine_logs
        ]

        return Response(consumption_events, status=200)
