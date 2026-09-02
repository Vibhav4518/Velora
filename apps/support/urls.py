from django.urls import path
from apps.support.views import (
    SupportTicketCreateView,
    CustomerSupportTicketListView,
    AdminSupportTicketListView,
    AdminSupportTicketDetailView
)

urlpatterns = [
    path('tickets/', SupportTicketCreateView.as_view(), name='support-ticket-create'),
    path('tickets/my/', CustomerSupportTicketListView.as_view(), name='support-ticket-customer-list'),
    path('tickets/admin/', AdminSupportTicketListView.as_view(), name='support-ticket-admin-list'),
    path('tickets/admin/<int:pk>/', AdminSupportTicketDetailView.as_view(), name='support-ticket-admin-detail'),
]
