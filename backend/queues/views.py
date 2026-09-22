from django.db.models import Max, Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Organization, Service, QueueToken
from .serializers import OrganizationSerializer, ServiceSerializer, QueueTokenSerializer


class StaffOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.all().order_by("name")
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.AllowAny]


class ServiceListView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Service.objects.filter(active=True).select_related("organization")
        org = self.request.query_params.get("organization")
        if org:
            qs = qs.filter(organization_id=org)
        return qs.order_by("organization__name", "name")


class MyTokenListView(generics.ListAPIView):
    serializer_class = QueueTokenSerializer

    def get_queryset(self):
        return QueueToken.objects.filter(user=self.request.user).select_related("service", "service__organization")


class CreateTokenView(APIView):
    def post(self, request):
        service_id = request.data.get("service")
        try:
            service = Service.objects.get(id=service_id, active=True)
        except Service.DoesNotExist:
            return Response({"detail": "Service not found."}, status=404)

        latest = QueueToken.objects.filter(service=service).aggregate(max_number=Max("number"))["max_number"] or 0
        token = QueueToken.objects.create(user=request.user, service=service, number=latest + 1)
        return Response(QueueTokenSerializer(token).data, status=status.HTTP_201_CREATED)


class CancelTokenView(APIView):
    def post(self, request, pk):
        try:
            token = QueueToken.objects.get(pk=pk, user=request.user)
        except QueueToken.DoesNotExist:
            return Response({"detail": "Token not found."}, status=404)
        if token.status != "WAITING":
            return Response({"detail": "Only waiting tokens can be cancelled."}, status=400)
        token.status = "CANCELLED"
        token.save(update_fields=["status"])
        return Response(QueueTokenSerializer(token).data)


class QueueStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, service_id):
        try:
            service = Service.objects.get(pk=service_id, active=True)
        except Service.DoesNotExist:
            return Response({"detail": "Service not found."}, status=404)
        current = QueueToken.objects.filter(service=service, status__in=["CALLED", "SERVING"]).order_by("created_at").first()
        waiting = QueueToken.objects.filter(service=service, status="WAITING").count()
        return Response({
            "service": ServiceSerializer(service).data,
            "current_token": QueueTokenSerializer(current).data if current else None,
            "waiting_count": waiting,
        })


class NextTokenView(APIView):
    permission_classes = [StaffOnly]

    def post(self, request, service_id):
        try:
            service = Service.objects.get(pk=service_id)
        except Service.DoesNotExist:
            return Response({"detail": "Service not found."}, status=404)

        current = QueueToken.objects.filter(service=service, status__in=["CALLED", "SERVING"]).order_by("created_at").first()
        if current:
            current.status = "COMPLETED"
            current.completed_at = timezone.now()
            current.save(update_fields=["status", "completed_at"])

        nxt = QueueToken.objects.filter(service=service, status="WAITING").order_by("created_at").first()
        if not nxt:
            return Response({"detail": "No waiting token."}, status=404)
        nxt.status = "SERVING"
        nxt.called_at = timezone.now()
        nxt.save(update_fields=["status", "called_at"])
        return Response(QueueTokenSerializer(nxt).data)


class AdminDashboardView(APIView):
    permission_classes = [StaffOnly]

    def get(self, request):
        tokens = QueueToken.objects.select_related("user", "service", "service__organization").order_by("-created_at")
        status_counts = {key: 0 for key, _ in QueueToken.STATUS_CHOICES}
        for row in tokens.values("status").annotate(total=Count("id")):
            status_counts[row["status"]] = row["total"]

        return Response({
            "stats": {
                "organizations": Organization.objects.count(),
                "services": Service.objects.count(),
                "tokens": tokens.count(),
                "waiting": status_counts["WAITING"],
                "called": status_counts["CALLED"],
                "serving": status_counts["SERVING"],
                "completed": status_counts["COMPLETED"],
                "skipped": status_counts["SKIPPED"],
                "cancelled": status_counts["CANCELLED"],
            },
            "organizations": list(Organization.objects.all().order_by("name").values("id", "name", "description", "address")),
            "services": list(Service.objects.select_related("organization").order_by("organization__name", "name").values(
                "id", "organization_id", "organization__name", "name", "code", "avg_service_minutes", "active"
            )),
            "tokens": QueueTokenSerializer(tokens[:100], many=True).data,
        })


class AdminOrganizationView(APIView):
    permission_classes = [StaffOnly]

    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    def put(self, request, pk):
        try:
            obj = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({"detail": "Organization not found."}, status=404)
        serializer = OrganizationSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        Organization.objects.filter(pk=pk).delete()
        return Response(status=204)


class AdminServiceView(APIView):
    permission_classes = [StaffOnly]

    def post(self, request):
        serializer = ServiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    def put(self, request, pk):
        try:
            obj = Service.objects.get(pk=pk)
        except Service.DoesNotExist:
            return Response({"detail": "Service not found."}, status=404)
        serializer = ServiceSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        Service.objects.filter(pk=pk).delete()
        return Response(status=204)


class AdminTokenActionView(APIView):
    permission_classes = [StaffOnly]

    def post(self, request, pk):
        try:
            token = QueueToken.objects.select_related("service", "service__organization").get(pk=pk)
        except QueueToken.DoesNotExist:
            return Response({"detail": "Token not found."}, status=404)

        action = request.data.get("action")
        now = timezone.now()
        if action == "call":
            if token.status != "WAITING":
                return Response({"detail": "Only waiting tokens can be called."}, status=400)
            token.status = "CALLED"
            token.called_at = now
            token.save(update_fields=["status", "called_at"])
        elif action == "serve":
            if token.status != "CALLED":
                return Response({"detail": "Only called tokens can be served."}, status=400)
            token.status = "SERVING"
            token.save(update_fields=["status"])
        elif action == "complete":
            if token.status not in ["CALLED", "SERVING"]:
                return Response({"detail": "Only active tokens can be completed."}, status=400)
            token.status = "COMPLETED"
            token.completed_at = now
            token.save(update_fields=["status", "completed_at"])
        elif action == "skip":
            if token.status not in ["WAITING", "CALLED"]:
                return Response({"detail": "This token cannot be skipped."}, status=400)
            token.status = "SKIPPED"
            token.save(update_fields=["status"])
        elif action == "cancel":
            if token.status not in ["WAITING", "CALLED"]:
                return Response({"detail": "This token cannot be cancelled."}, status=400)
            token.status = "CANCELLED"
            token.save(update_fields=["status"])
        else:
            return Response({"detail": "Invalid action."}, status=400)

        return Response(QueueTokenSerializer(token).data)
