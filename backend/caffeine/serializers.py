from rest_framework import serializers
from .models import CaffeineLog

class CaffeineLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaffeineLog
        fields = [
            "id",
            "user",
            "beverage_name",
            "caffeine",
            "beverage_size_ml",
            "sugar_content_g",
            "calories_kcal",
            "image_url",
            "additional_notes",
            "confirmed",
            "created_at"
        ]
        read_only_fields = ["user", "created_at", "confirmed"]
