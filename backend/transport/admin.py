from django.contrib import admin

from .models import (
    Driver,
    Vehicle,
    TransportRoute,
    BusStop,
    StudentTransportAssignment,
)


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "phone",
        "license_number",
        "license_expiry_date",
        "school",
        "is_active",
    )

    search_fields = (
        "full_name",
        "phone",
        "license_number",
    )

    list_filter = (
        "school",
        "is_active",
    )


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "registration_number",
        "vehicle_type",
        "manufacturer",
        "model",
        "capacity",
        "driver",
        "school",
        "is_active",
    )

    search_fields = (
        "registration_number",
        "manufacturer",
        "model",
    )

    list_filter = (
        "school",
        "vehicle_type",
        "is_active",
    )


@admin.register(TransportRoute)
class TransportRouteAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "school",
        "vehicle",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )

    list_filter = (
        "school",
        "is_active",
    )


@admin.register(BusStop)
class BusStopAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "route",
        "stop_order",
        "pickup_time",
        "dropoff_time",
        "is_active",
    )

    search_fields = (
        "name",
        "address",
        "route__name",
    )

    list_filter = (
        "route",
        "is_active",
    )


@admin.register(StudentTransportAssignment)
class StudentTransportAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "route",
        "pickup_stop",
        "dropoff_stop",
        "academic_session",
        "start_date",
        "end_date",
        "status",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "route__name",
    )

    list_filter = (
        "academic_session",
        "status",
        "route",
    )