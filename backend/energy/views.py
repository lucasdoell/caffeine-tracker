from rest_framework import generics, permissions
from .models import EnergyLog
from .serializers import EnergyLogSerializer

class EnergyLogListCreateAPIView(generics.ListCreateAPIView):
    queryset = EnergyLog.objects.all()
    serializer_class = EnergyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EnergyLogRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EnergyLog.objects.all()
    serializer_class = EnergyLogSerializer
    permission_classes = [permissions.IsAuthenticated]
