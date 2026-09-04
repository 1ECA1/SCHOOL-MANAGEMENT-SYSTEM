from django.contrib import admin

from .models import (
    Hostel,
    HostelRoom,
    Bed,
    HostelAllocation,
)


@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "school",
        "gender",
        "total_rooms",
        "total_capacity",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "code",
        "school__name",
    )

    list_filter = (
        "school",
        "gender",
        "is_active",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("name",)


@admin.register(HostelRoom)
class HostelRoomAdmin(admin.ModelAdmin):
    list_display = (
        "room_number",
        "hostel",
        "floor",
        "capacity",
        "is_active",
        "created_at",
    )

    search_fields = (
        "room_number",
        "hostel__name",
        "hostel__code",
    )

    list_filter = (
        "hostel",
        "is_active",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("hostel", "room_number")


@admin.register(Bed)
class BedAdmin(admin.ModelAdmin):
    list_display = (
        "bed_number",
        "room",
        "hostel_name",
        "is_active",
        "created_at",
    )

    search_fields = (
        "bed_number",
        "room__room_number",
        "room__hostel__name",
    )

    list_filter = (
        "is_active",
        "room__hostel",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("room", "bed_number")

    @admin.display(description="Hostel")
    def hostel_name(self, obj):
        return obj.room.hostel.name


@admin.register(HostelAllocation)
class HostelAllocationAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "hostel",
        "room",
        "bed",
        "academic_session",
        "check_in_date",
        "check_out_date",
        "status",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "hostel__name",
        "room__room_number",
        "bed__bed_number",
    )

    list_filter = (
        "hostel",
        "academic_session",
        "status",
        "check_in_date",
        "check_out_date",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-check_in_date",)