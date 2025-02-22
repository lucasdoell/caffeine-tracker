from rest_framework import serializers
from .models import EnergyLog

class EnergyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyLog
        fields = "__all__"
        read_only_fields = ["user", "timestamp"]
