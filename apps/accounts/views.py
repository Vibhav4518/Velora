from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from apps.accounts.services import AuthService
from apps.accounts.serializers import (
    RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer
)
from apps.users.serializers import UserSerializer
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user, tokens = AuthService.register_user(serializer.validated_data)
            return custom_response(
                data={'user': UserSerializer(user).data, 'tokens': tokens},
                message="Registration successful",
                status_code=201
            )
        except ValueError as e:
            return custom_response(message=str(e), status_code=400, success=False)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if not user:
            return custom_response(message="Invalid email or password", status_code=401, success=False)
        if not user.is_active:
            return custom_response(message="Account disabled", status_code=403, success=False)

        tokens = AuthService.generate_tokens_for_user(user)
        return custom_response(
            data={'user': UserSerializer(user).data, 'tokens': tokens},
            message="Login successful"
        )

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return custom_response(data=UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return custom_response(data=serializer.data, message="Profile updated successfully")

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data['old_password']):
            return custom_response(message="Incorrect old password", status_code=400, success=False)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return custom_response(message="Password changed successfully")

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return custom_response(message="Password reset link sent to your email")

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return custom_response(message="Password reset successfully")
