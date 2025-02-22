from rest_framework import generics, permissions
from .models import CaffeineLog
from .serializers import CaffeineLogSerializer

class CaffeineLogCreateAPIView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineLogSerializer

    def perform_create(self, serializer):
        # Mark the entry as confirmed (user has accepted the AI's analysis)
        serializer.save(user=self.request.user, confirmed=True)
