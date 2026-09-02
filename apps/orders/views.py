from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer, CheckoutSerializer
from apps.orders.services import OrderService
from apps.orders.selectors import get_order_list, get_order_by_number
from apps.users.permissions import IsStaffOrAdmin
from apps.accounts.exceptions import custom_response
from apps.audit.services import AuditService

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = OrderService.place_order(
            user=request.user,
            address_id=serializer.validated_data['address_id'],
            coupon_code=serializer.validated_data.get('coupon_code'),
            payment_method=serializer.validated_data.get('payment_method', 'CREDIT_CARD')
        )

        return custom_response(
            data=OrderSerializer(order).data,
            message="Order placed successfully",
            status_code=201
        )


class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        req = self.request
        return get_order_list(
            user=req.user,
            search=req.query_params.get('search'),
            status_param=req.query_params.get('status'),
            payment_status=req.query_params.get('payment_status')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return custom_response(data=serializer.data)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = 'order_number'

    def get_object(self):
        order_number = self.kwargs.get('order_number')
        order = get_order_by_number(self.request.user, order_number)
        if not order:
            from rest_framework.exceptions import NotFound
            raise NotFound("Order not found")
        return order

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return custom_response(data=serializer.data)


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return custom_response(message="Order not found", status_code=404, success=False)

        reason = request.data.get('reason', 'Customer Request')
        cancelled_order = OrderService.cancel_order(user=request.user, order_id=order.id, reason=reason)

        return custom_response(
            data=OrderSerializer(cancelled_order).data,
            message="Order cancelled successfully"
        )


class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def patch(self, request, order_number):
        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return custom_response(message="Order not found", status_code=404, success=False)

        new_status = request.data.get('order_status')
        new_payment_status = request.data.get('payment_status')

        if new_status:
            order.order_status = new_status
        if new_payment_status:
            order.payment_status = new_payment_status

        order.save()

        AuditService.log_action(
            actor=request.user,
            action="UPDATE_ORDER_STATUS",
            resource="Order",
            resource_id=str(order.id),
            metadata={'order_status': order.order_status, 'payment_status': order.payment_status}
        )

        return custom_response(
            data=OrderSerializer(order).data,
            message="Order status updated successfully"
        )
