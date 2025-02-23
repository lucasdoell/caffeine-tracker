from rest_framework import generics, permissions
from .models import CaffeineLog
from .serializers import CaffeineLogSerializer

class CaffeineLogCreateAPIView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaffeineLogSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, confirmed=True)
