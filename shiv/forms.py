from django import forms
from .models import User, UserAddress

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "mobile_no", "profile_image", "username"]

class UserAddressForm(forms.ModelForm):
    class Meta:
        model = UserAddress
        fields = [
            "full_name",
            "mobile_no",
            "address_line1",
            "address_line2",
            "city",
            "state_name",
            "country_name",
            "pincode",
            "is_default",
        ]