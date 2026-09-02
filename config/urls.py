from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI Schema & Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # REST API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/brands/', include('apps.brands.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/products/', include('apps.catalog.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/shipping/', include('apps.shipping.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/invoices/', include('apps.invoices.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/support/', include('apps.support.urls')),
]
