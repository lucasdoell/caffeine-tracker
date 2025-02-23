from rest_framework import serializers
from .models import CaffeineLog

class CaffeineLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaffeineLog
        fields = [
            "id",
            "user",
            "beverage_name",
            "serving_size",
            "caffeine_mg",
            "total_fat_g",
            "sodium_mg",
            "total_carbohydrates_g",
            "sugars_g",
            "added_sugars_g",
            "protein_g",
            "taurine_mg",
            "calories_kcal",
            "b_vitamins",
            "other_ingredients",
            "image_url",
            "additional_notes",
            "confirmed",
            "created_at"
        ]
        read_only_fields = ["user", "created_at", "confirmed"]
