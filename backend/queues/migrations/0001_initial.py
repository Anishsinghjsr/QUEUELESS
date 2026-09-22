from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="Organization",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("description", models.TextField(blank=True)),
                ("address", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Service",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("code", models.CharField(default="A", max_length=10)),
                ("avg_service_minutes", models.PositiveIntegerField(default=5)),
                ("active", models.BooleanField(default=True)),
                ("organization", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="services", to="queues.organization")),
            ],
        ),
        migrations.CreateModel(
            name="QueueToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("number", models.PositiveIntegerField()),
                ("status", models.CharField(choices=[("WAITING","Waiting"),("CALLED","Called"),("SERVING","Serving"),("COMPLETED","Completed"),("SKIPPED","Skipped"),("CANCELLED","Cancelled")], default="WAITING", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("called_at", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("service", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tokens", to="queues.service")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="queue_tokens", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering":["created_at"]},
        ),
    ]
