from apps.invoices.models import Invoice

class InvoiceService:
    @staticmethod
    def generate_invoice(order):
        inv_num = f"INV-{order.order_number}"
        invoice, _ = Invoice.objects.get_or_create(
            order=order,
            defaults={'invoice_number': inv_num}
        )
        return invoice
