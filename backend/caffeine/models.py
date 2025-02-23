import uuid
from django.db import models
from users.models import User

class CaffeineLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="caffeine_logs")
    beverage_name = models.CharField(max_length=100, blank=True, null=True)
    caffeine = models.FloatField()
    beverage_size_ml = models.FloatField(blank=True, null=True)
    sugar_content_g = models.FloatField(blank=True, null=True)
    calories_kcal = models.FloatField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.beverage_name} ({self.caffeine} mg)"
