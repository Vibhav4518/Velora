from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from apps.support.models import SupportTicket
from apps.support.serializers import SupportTicketSerializer
from apps.users.permissions import IsStaffOrAdmin
from apps.accounts.exceptions import custom_response

class SupportTicketCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SupportTicketSerializer

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')

        if not (name and email and message):
            return custom_response(message="Name, email, and message are required.", status_code=400, success=False)

        user = request.user if request.user and request.user.is_authenticated else None
        ticket = SupportTicket.objects.create(
            user=user,
            name=name,
            email=email,
            subject=subject or 'General Inquiry',
            message=message
        )
        return custom_response(data=SupportTicketSerializer(ticket).data, message="Support ticket created successfully", status_code=201)


class CustomerSupportTicketListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return custom_response(data=SupportTicketSerializer(queryset, many=True).data)


class AdminSupportTicketListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        qs = SupportTicket.objects.all().order_by('-created_at')
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return custom_response(data=SupportTicketSerializer(queryset, many=True).data)


class AdminSupportTicketDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        status = request.data.get('status')
        admin_response = request.data.get('admin_response')

        if status:
            instance.status = status
        if admin_response is not None:
            instance.admin_response = admin_response

        instance.save()
        return custom_response(data=SupportTicketSerializer(instance).data, message="Support ticket updated successfully")
