from django import forms

from .models import Deal, Product, Category, User, UserAddress, BlogCategory, BlogPost,ContactMessage,ProductReview


# ==================================
# PROFILE FORM
# ==================================
class ProfileForm(forms.ModelForm):
    class Meta:
        model = User

        fields = [
            "first_name",
            "last_name",
            "email",
            "mobile_no",
            "profile_image",
            "username",
        ]

        widgets = {
            "first_name": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter first name",
            }),

            "last_name": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter last name",
            }),

            "email": forms.EmailInput(attrs={
                "class": "form-control",
                "placeholder": "Enter email address",
            }),

            "mobile_no": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter mobile number",
            }),

            "profile_image": forms.ClearableFileInput(attrs={
                "class": "form-control",
            }),

            "username": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter username",
            }),
        }


# ==================================
# USER ADDRESS FORM
# ==================================
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

        widgets = {
            "full_name": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter full name",
            }),

            "mobile_no": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter mobile number",
            }),

            "address_line1": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "House number, street or area",
            }),

            "address_line2": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Landmark or additional address",
            }),

            "city": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter city",
            }),

            "state_name": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter state",
            }),

            "country_name": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter country",
            }),

            "pincode": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter pincode",
            }),

            "is_default": forms.CheckboxInput(attrs={
                "class": "form-check-input",
            }),
        }


# ==================================
# DEAL FORM
# ==================================
class DealForm(forms.ModelForm):
    class Meta:
        model = Deal

        fields = [
            "title",
            "description",
            "discount_type",
            "discount_value",
            "products",
            "categories",
            "banner_image",
            "start_date",
            "end_date",
            "priority",
            "is_active",
        ]

        widgets = {
            "title": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Example: Summer Sale",
            }),

            "description": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 4,
                "placeholder": "Enter deal description",
            }),

            "discount_type": forms.Select(attrs={
                "class": "form-select",
            }),

            "discount_value": forms.NumberInput(attrs={
                "class": "form-control",
                "placeholder": "Example: 20",
                "min": "0.01",
                "step": "0.01",
            }),

            "products": forms.SelectMultiple(attrs={
                "class": "form-select",
                "size": "8",
            }),

            "categories": forms.SelectMultiple(attrs={
                "class": "form-select",
                "size": "8",
            }),

            "banner_image": forms.ClearableFileInput(attrs={
                "class": "form-control",
            }),

            "start_date": forms.DateTimeInput(
                format="%Y-%m-%dT%H:%M",
                attrs={
                    "class": "form-control",
                    "type": "datetime-local",
                }
            ),

            "end_date": forms.DateTimeInput(
                format="%Y-%m-%dT%H:%M",
                attrs={
                    "class": "form-control",
                    "type": "datetime-local",
                }
            ),

            "priority": forms.NumberInput(attrs={
                "class": "form-control",
                "min": "0",
                "placeholder": "Example: 10",
            }),

            "is_active": forms.CheckboxInput(attrs={
                "class": "form-check-input",
            }),
        }

        labels = {
            "title": "Deal Title",
            "description": "Deal Description",
            "discount_type": "Discount Type",
            "discount_value": "Discount Value",
            "products": "Select Products",
            "categories": "Select Categories",
            "banner_image": "Deal Banner",
            "start_date": "Start Date and Time",
            "end_date": "End Date and Time",
            "priority": "Priority",
            "is_active": "Active Deal",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["products"].queryset = Product.objects.filter(
            is_active=True
        ).select_related(
            "category"
        ).order_by(
            "product_name"
        )

        self.fields["categories"].queryset = Category.objects.filter(
            is_active=True
        ).order_by(
            "category_name"
        )

        self.fields["start_date"].input_formats = [
            "%Y-%m-%dT%H:%M",
        ]

        self.fields["end_date"].input_formats = [
            "%Y-%m-%dT%H:%M",
        ]

        self.fields["products"].required = False
        self.fields["categories"].required = False
        self.fields["banner_image"].required = False
        self.fields["description"].required = False

    def clean_discount_value(self):
        discount_type = self.cleaned_data.get(
            "discount_type"
        )

        discount_value = self.cleaned_data.get(
            "discount_value"
        )

        if discount_value is None:
            return discount_value

        if discount_value <= 0:
            raise forms.ValidationError(
                "Discount value must be greater than zero."
            )

        if (
            discount_type == "percentage"
            and discount_value > 100
        ):
            raise forms.ValidationError(
                "Percentage discount cannot be greater than 100."
            )

        return discount_value

    def clean(self):
        cleaned_data = super().clean()

        products = cleaned_data.get("products")
        categories = cleaned_data.get("categories")
        start_date = cleaned_data.get("start_date")
        end_date = cleaned_data.get("end_date")

        if not products and not categories:
            raise forms.ValidationError(
                "Select at least one product or one category."
            )

        if (
            start_date
            and end_date
            and end_date <= start_date
        ):
            self.add_error(
                "end_date",
                "End date must be after the start date."
            )

        return cleaned_data

# ==========================================================
# REUSABLE BLOG CATEGORY FORM
# ==========================================================

class BlogCategoryForm(forms.ModelForm):

    class Meta:
        model = BlogCategory

        fields = [
            "category_name",
            "description",
            "is_active",
        ]

        widgets = {
            "category_name": forms.TextInput(
                attrs={
                    "class": "form-control product-input",
                    "placeholder": "Example: Fashion Guides",
                }
            ),

            "description": forms.Textarea(
                attrs={
                    "class": "form-control product-input",
                    "rows": 3,
                    "placeholder": "Short category description",
                }
            ),

            "is_active": forms.CheckboxInput(
                attrs={
                    "class": "form-check-input",
                }
            ),
        }


# ==========================================================
# REUSABLE BLOG POST FORM
# ==========================================================

class BlogPostForm(forms.ModelForm):

    published_at = forms.DateTimeField(
        required=True,
        input_formats=[
            "%Y-%m-%dT%H:%M",
        ],
        widget=forms.DateTimeInput(
            format="%Y-%m-%dT%H:%M",
            attrs={
                "type": "datetime-local",
                "class": "form-control product-input",
            }
        )
    )

    class Meta:
        model = BlogPost

        fields = [
            "category",
            "title",
            "short_description",
            "content",
            "image",
            "is_featured",
            "is_published",
            "published_at",
        ]

        widgets = {
            "category": forms.Select(
                attrs={
                    "class": "form-select modal-select",
                }
            ),

            "title": forms.TextInput(
                attrs={
                    "class": "form-control product-input",
                    "placeholder": "Enter blog title",
                }
            ),

            "short_description": forms.Textarea(
                attrs={
                    "class": "form-control product-input",
                    "rows": 3,
                    "placeholder": "Short description shown on blog cards",
                }
            ),

            "content": forms.Textarea(
                attrs={
                    "class": "form-control product-input blog-content-input",
                    "rows": 10,
                    "placeholder": "Write the complete blog article",
                }
            ),

            "image": forms.ClearableFileInput(
                attrs={
                    "class": "form-control product-input",
                    "accept": "image/*",
                }
            ),

            "is_featured": forms.CheckboxInput(
                attrs={
                    "class": "form-check-input",
                }
            ),

            "is_published": forms.CheckboxInput(
                attrs={
                    "class": "form-check-input",
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["category"].queryset = (
            BlogCategory.objects
            .filter(is_active=True)
            .order_by("category_name")
        )
        
# ==========================================================
# CONTACT MESSAGE FORM
# ==========================================================

class ContactMessageForm(forms.ModelForm):

    class Meta:

        model = ContactMessage

        fields = [
            "name",
            "email",
            "phone",
            "subject",
            "message",
        ]

        widgets = {
            "name": forms.TextInput(
                attrs={
                    "class": "form-control contact-input",
                    "placeholder": "Your Name",
                    "autocomplete": "name",
                }
            ),

            "email": forms.EmailInput(
                attrs={
                    "class": "form-control contact-input",
                    "placeholder": "Your Email",
                    "autocomplete": "email",
                }
            ),

            "phone": forms.TextInput(
                attrs={
                    "class": "form-control contact-input",
                    "placeholder": "Phone Number (optional)",
                    "autocomplete": "tel",
                }
            ),

            "subject": forms.TextInput(
                attrs={
                    "class": "form-control contact-input",
                    "placeholder": "Subject",
                }
            ),

            "message": forms.Textarea(
                attrs={
                    "class": "form-control contact-input contact-message-input",
                    "placeholder": "How can we help you?",
                    "rows": 7,
                }
            ),
        }
        
# ==========================================================
# PRODUCT REVIEW FORM
# ==========================================================

class ProductReviewForm(forms.ModelForm):

    class Meta:

        model = ProductReview

        fields = [
            "rating",
            "title",
            "comment",
        ]

        widgets = {
            "rating": forms.HiddenInput(),

            "title": forms.TextInput(
                attrs={
                    "class": "form-control product-review-input",
                    "placeholder": "Give your review a title",
                    "maxlength": "150",
                }
            ),

            "comment": forms.Textarea(
                attrs={
                    "class": (
                        "form-control "
                        "product-review-input "
                        "product-review-textarea"
                    ),
                    "placeholder": (
                        "Share your experience with this product..."
                    ),
                    "rows": 5,
                }
            ),
        }

    def clean_rating(self):

        rating = self.cleaned_data.get(
            "rating"
        )

        if rating not in [
            1,
            2,
            3,
            4,
            5,
        ]:
            raise forms.ValidationError(
                "Please select a rating."
            )

        return rating