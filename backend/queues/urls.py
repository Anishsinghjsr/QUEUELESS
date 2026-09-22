from django.urls import path
from .views import (
    OrganizationListView, ServiceListView, MyTokenListView,
    CreateTokenView, CancelTokenView, QueueStatusView, NextTokenView,
    AdminDashboardView, AdminOrganizationView, AdminServiceView, AdminTokenActionView,
)

urlpatterns = [
    path("organizations/", OrganizationListView.as_view()),
    path("services/", ServiceListView.as_view()),
    path("tokens/", MyTokenListView.as_view()),
    path("tokens/create/", CreateTokenView.as_view()),
    path("tokens/<int:pk>/cancel/", CancelTokenView.as_view()),
    path("services/<int:service_id>/status/", QueueStatusView.as_view()),
    path("services/<int:service_id>/next/", NextTokenView.as_view()),
    path("admin/dashboard/", AdminDashboardView.as_view()),
    path("admin/organizations/", AdminOrganizationView.as_view()),
    path("admin/organizations/<int:pk>/", AdminOrganizationView.as_view()),
    path("admin/services/", AdminServiceView.as_view()),
    path("admin/services/<int:pk>/", AdminServiceView.as_view()),
    path("admin/tokens/<int:pk>/action/", AdminTokenActionView.as_view()),
]
