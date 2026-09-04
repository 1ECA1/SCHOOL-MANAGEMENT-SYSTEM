from rest_framework import serializers

from .models import (
    Hostel,
    HostelRoom,
    Bed,
    HostelAllocation,
)


class HostelSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    gender_display = serializers.CharField(
        source="get_gender_display",
        read_only=True,
    )

    room_count = serializers.SerializerMethodField()
    bed_count = serializers.SerializerMethodField()

    class Meta:
        model = Hostel

        fields = [
            "id",
            "school",
            "school_name",
            "name",
            "code",
            "gender",
            "gender_display",
            "address",
            "description",
            "total_rooms",
            "total_capacity",
            "room_count",
            "bed_count",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school_name",
            "gender_display",
            "room_count",
            "bed_count",
            "created_at",
            "updated_at",
        ]

    def get_room_count(self, obj):
        return obj.rooms.count()

    def get_bed_count(self, obj):
        return Bed.objects.filter(
            room__hostel=obj
        ).count()


class HostelRoomSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(
        source="hostel.name",
        read_only=True,
    )

    bed_count = serializers.SerializerMethodField()

    class Meta:
        model = HostelRoom

        fields = [
            "id",
            "hostel",
            "hostel_name",
            "room_number",
            "floor",
            "capacity",
            "description",
            "bed_count",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "hostel_name",
            "bed_count",
            "created_at",
        ]

    def get_bed_count(self, obj):
        return obj.beds.count()


class BedSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(
        source="room.room_number",
        read_only=True,
    )

    hostel_name = serializers.CharField(
        source="room.hostel.name",
        read_only=True,
    )

    is_allocated = serializers.SerializerMethodField()

    class Meta:
        model = Bed

        fields = [
            "id",
            "room",
            "room_number",
            "hostel_name",
            "bed_number",
            "is_active",
            "is_allocated",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "room_number",
            "hostel_name",
            "is_allocated",
            "created_at",
        ]

    def get_is_allocated(self, obj):
        return obj.allocations.filter(
            status=HostelAllocation.Status.ACTIVE
        ).exists()


class HostelAllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    admission_number = serializers.CharField(
        source="student.admission_number",
        read_only=True,
    )

    hostel_name = serializers.CharField(
        source="hostel.name",
        read_only=True,
    )

    room_number = serializers.CharField(
        source="room.room_number",
        read_only=True,
    )

    bed_number = serializers.CharField(
        source="bed.bed_number",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = HostelAllocation

        fields = [
            "id",
            "student",
            "student_name",
            "admission_number",
            "hostel",
            "hostel_name",
            "room",
            "room_number",
            "bed",
            "bed_number",
            "academic_session",
            "academic_session_name",
            "check_in_date",
            "check_out_date",
            "status",
            "status_display",
            "notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student_name",
            "admission_number",
            "hostel_name",
            "room_number",
            "bed_number",
            "academic_session_name",
            "status_display",
            "created_at",
            "updated_at",
        ]