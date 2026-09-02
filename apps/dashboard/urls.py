from django.urls import path
from apps.dashboard.views import AdminDashboardStatsView

urlpatterns = [
    path('stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
]
