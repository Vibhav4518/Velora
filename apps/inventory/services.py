from apps.inventory.models import InventoryLog

class InventoryService:
    @staticmethod
    def reduce_stock(product, quantity):
        if product.stock_quantity < quantity:
            raise ValueError(f"Insufficient stock for {product.name}. Requested: {quantity}, Available: {product.stock_quantity}")
        prev = product.stock_quantity
        product.stock_quantity -= quantity
        product.save()

        InventoryLog.objects.create(
            product=product,
            change_amount=-quantity,
            reason='Order Deduction',
            previous_stock=prev,
            new_stock=product.stock_quantity
        )

    @staticmethod
    def restore_stock(product, quantity):
        prev = product.stock_quantity
        product.stock_quantity += quantity
        product.save()

        InventoryLog.objects.create(
            product=product,
            change_amount=quantity,
            reason='Order Restored / Cancelled',
            previous_stock=prev,
            new_stock=product.stock_quantity
        )
