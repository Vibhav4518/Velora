from django.urls import path
from apps.invoices.views import OrderInvoiceView

urlpatterns = [
    path('order/<str:order_number>/', OrderInvoiceView.as_view(), name='invoice-by-order'),
]
