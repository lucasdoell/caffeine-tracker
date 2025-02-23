import uuid
from django.db import models
from users.models import User

class CaffeineLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="caffeine_logs")
    beverage_name = models.CharField(max_length=100, blank=True, null=True)  # AI predicted or user-entered
    caffeine_amount_mg = models.FloatField()  # Required: the main nutritional value
    beverage_size_ml = models.FloatField(blank=True, null=True)  # Optional serving size
    sugar_content_g = models.FloatField(blank=True, null=True)  # Optional sugar info
    calories_kcal = models.FloatField(blank=True, null=True)  # Optional calorie info
    image_url = models.URLField(blank=True, null=True)  # URL pointing to Cloudflare R2 image
    additional_notes = models.TextField(blank=True, null=True)  # Optional free-form notes
    confirmed = models.BooleanField(default=False)  # Set to True when the user confirms the AI output
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.beverage_name} ({self.caffeine_amount_mg} mg)"
