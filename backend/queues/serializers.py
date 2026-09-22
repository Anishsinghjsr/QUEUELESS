from rest_framework import serializers
from .models import Organization, Service, QueueToken

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"

class ServiceSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    class Meta:
        model = Service
        fields = "__all__"

class QueueTokenSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    organization_name = serializers.CharField(source="service.organization.name", read_only=True)
    user = serializers.CharField(source="user.username", read_only=True)
    people_ahead = serializers.SerializerMethodField()
    estimated_wait_minutes = serializers.SerializerMethodField()

    class Meta:
        model = QueueToken
        fields = (
            "id", "user", "service", "service_name", "organization_name",
            "number", "status", "created_at", "called_at", "completed_at",
            "people_ahead", "estimated_wait_minutes"
        )
        read_only_fields = ("user", "number", "status", "called_at", "completed_at")

    def get_people_ahead(self, obj):
        if obj.status != "WAITING":
            return 0
        return QueueToken.objects.filter(
            service=obj.service, status="WAITING",
            created_at__lt=obj.created_at
        ).count()

    def get_estimated_wait_minutes(self, obj):
        return self.get_people_ahead(obj) * obj.service.avg_service_minutes
