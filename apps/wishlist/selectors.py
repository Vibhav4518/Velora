from apps.wishlist.models import Wishlist

def get_user_wishlist(user):
    wishlist, _ = Wishlist.objects.get_or_create(user=user)
    return wishlist
