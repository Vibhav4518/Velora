from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from apps.shipping.models import Address
from apps.shipping.serializers import AddressSerializer
from apps.accounts.exceptions import custom_response

class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', '-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return custom_response(data=AddressSerializer(queryset, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        is_first = not Address.objects.filter(user=request.user).exists()
        is_default = request.data.get('is_default', False) or is_first
        address = serializer.save(user=request.user, is_default=is_default)
        return custom_response(data=AddressSerializer(address).data, message="Address saved successfully", status_code=201)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return custom_response(data=AddressSerializer(instance).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        address = serializer.save()
        return custom_response(data=AddressSerializer(address).data, message="Address updated successfully")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        was_default = instance.is_default
        user = instance.user
        instance.delete()
        if was_default:
            first_remaining = Address.objects.filter(user=user).first()
            if first_remaining:
                first_remaining.is_default = True
                first_remaining.save()
        return custom_response(message="Address deleted successfully")


class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        address = Address.objects.filter(user=request.user, id=pk).first()
        if not address:
            return custom_response(message="Address not found", status_code=404, success=False)
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        address.is_default = True
        address.save()
        return custom_response(data=AddressSerializer(address).data, message="Default address updated successfully")

