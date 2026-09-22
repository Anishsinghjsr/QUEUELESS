from django.contrib.auth.models import User
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=10, default="A")
    avg_service_minutes = models.PositiveIntegerField(default=5)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

class QueueToken(models.Model):
    STATUS_CHOICES = [
        ("WAITING", "Waiting"),
        ("CALLED", "Called"),
        ("SERVING", "Serving"),
        ("COMPLETED", "Completed"),
        ("SKIPPED", "Skipped"),
        ("CANCELLED", "Cancelled"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="queue_tokens")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="tokens")
    number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="WAITING")
    created_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.service.code}-{self.number}"
