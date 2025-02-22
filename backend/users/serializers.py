from rest_framework import serializers
from .models import User
from rest_framework.authtoken.models import Token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "caffeine_sensitivity"]

class TokenSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Token
        fields = ["key", "user"]
