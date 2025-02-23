import uuid
from django.db import models
from users.models import User

class CaffeineLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="caffeine_logs")
    
    # Required Field
    caffeine_mg = models.FloatField()  # This must always be provided

    # Optional Fields
    beverage_name = models.CharField(max_length=100, blank=True, null=True)
    serving_size = models.CharField(max_length=50, blank=True, null=True)
    total_fat_g = models.FloatField(blank=True, null=True)
    sodium_mg = models.FloatField(blank=True, null=True)
    total_carbohydrates_g = models.FloatField(blank=True, null=True)
    sugars_g = models.FloatField(blank=True, null=True)
    added_sugars_g = models.FloatField(blank=True, null=True)
    protein_g = models.FloatField(blank=True, null=True)
    taurine_mg = models.FloatField(blank=True, null=True)
    calories_kcal = models.FloatField(blank=True, null=True)

    # Nested Fields (Stored as JSON)
    b_vitamins = models.JSONField(blank=True, null=True)
    other_ingredients = models.JSONField(blank=True, null=True)

    # Additional Fields
    image_url = models.URLField(blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.beverage_name} ({self.caffeine_mg} mg)"
