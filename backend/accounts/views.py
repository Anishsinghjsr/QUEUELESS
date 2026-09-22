from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class LogoutView(APIView):
    def post(self, request):
        return Response({"message": "Logged out. Remove the JWT tokens on the client."})
