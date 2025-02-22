from rest_framework import serializers
from .models import CaffeineLog

class CaffeineLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaffeineLog
        fields = "__all__"
        read_only_fields = ["user", "created_at"]
