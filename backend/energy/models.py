import uuid
from django.db import models
from users.models import User

class EnergyLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="energy_logs")
    energy_level = models.IntegerField(choices=[
        (1, "Very Low"),
        (2, "Low"),
        (3, "Moderate"),
        (4, "High"),
        (5, "Very High")
    ])
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_energy_level_display()} at {self.timestamp}"
