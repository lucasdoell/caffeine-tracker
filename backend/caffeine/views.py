from rest_framework import generics, permissions
from .models import CaffeineLog
from .serializers import CaffeineLogSerializer

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
