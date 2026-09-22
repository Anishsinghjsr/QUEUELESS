from django.contrib import admin
from .models import Organization, Service, QueueToken

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "created_at")
    search_fields = ("name", "address")

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "code", "avg_service_minutes", "active")
    list_filter = ("active", "organization")
    search_fields = ("name",)

@admin.register(QueueToken)
class QueueTokenAdmin(admin.ModelAdmin):
    list_display = ("number", "service", "user", "status", "created_at")
    list_filter = ("status", "service")
    search_fields = ("user__username",)
