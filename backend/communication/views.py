from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Announcement, Message
from .serializers import (
    AnnouncementSerializer,
    MessageSerializer,
)


class AnnouncementListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        announcements = Announcement.objects.select_related(
            "school"
        )

        school_id = request.query_params.get("school")
        audience = request.query_params.get("audience")
        published = request.query_params.get("is_published")

        if school_id:
            announcements = announcements.filter(
                school_id=school_id
            )

        if audience:
            announcements = announcements.filter(
                audience=audience
            )

        if published is not None:
            announcements = announcements.filter(
                is_published=published.lower() == "true"
            )

        serializer = AnnouncementSerializer(
            announcements,
            many=True,
        )

        return Response({
            "message": "Announcements retrieved successfully.",
            "count": announcements.count(),
            "announcements": serializer.data,
        })

    def post(self, request):
        serializer = AnnouncementSerializer(
            data=request.data
        )

        if serializer.is_valid():
            announcement = serializer.save()

            return Response(
                {
                    "message": (
                        "Announcement created successfully."
                    ),
                    "data": AnnouncementSerializer(
                        announcement
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class AnnouncementDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return Announcement.objects.select_related(
            "school"
        ).filter(pk=pk).first()

    def get(self, request, pk):
        announcement = self.get_object(pk)

        if not announcement:
            return Response(
                {
                    "message": "Announcement not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AnnouncementSerializer(
            announcement
        )

        return Response({
            "message": "Announcement retrieved successfully.",
            "data": serializer.data,
        })

    def put(self, request, pk):
        announcement = self.get_object(pk)

        if not announcement:
            return Response(
                {
                    "message": "Announcement not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AnnouncementSerializer(
            announcement,
            data=request.data,
        )

        if serializer.is_valid():
            announcement = serializer.save()

            return Response({
                "message": (
                    "Announcement updated successfully."
                ),
                "data": AnnouncementSerializer(
                    announcement
                ).data,
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, pk):
        announcement = self.get_object(pk)

        if not announcement:
            return Response(
                {
                    "message": "Announcement not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AnnouncementSerializer(
            announcement,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            announcement = serializer.save()

            return Response({
                "message": (
                    "Announcement updated successfully."
                ),
                "data": AnnouncementSerializer(
                    announcement
                ).data,
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        announcement = self.get_object(pk)

        if not announcement:
            return Response(
                {
                    "message": "Announcement not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        announcement.delete()

        return Response({
            "message": (
                "Announcement deleted successfully."
            )
        })


class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.select_related(
            "school",
            "sender",
            "recipient",
        )

        school_id = request.query_params.get("school")
        status_filter = request.query_params.get("status")
        sender_id = request.query_params.get("sender")
        recipient_id = request.query_params.get("recipient")

        if school_id:
            messages = messages.filter(
                school_id=school_id
            )

        if status_filter:
            messages = messages.filter(
                status=status_filter
            )

        if sender_id:
            messages = messages.filter(
                sender_id=sender_id
            )

        if recipient_id:
            messages = messages.filter(
                recipient_id=recipient_id
            )

        serializer = MessageSerializer(
            messages,
            many=True,
        )

        return Response({
            "message": "Messages retrieved successfully.",
            "count": messages.count(),
            "messages": serializer.data,
        })

    def post(self, request):
        serializer = MessageSerializer(
            data=request.data
        )

        if serializer.is_valid():
            message = serializer.save(
                sender=request.user,
                status=Message.Status.SENT,
            )

            return Response(
                {
                    "message": "Message sent successfully.",
                    "data": MessageSerializer(
                        message
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return Message.objects.select_related(
            "school",
            "sender",
            "recipient",
        ).filter(pk=pk).first()

    def get(self, request, pk):
        message = self.get_object(pk)

        if not message:
            return Response(
                {
                    "message": "Message not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MessageSerializer(message)

        return Response({
            "message": "Message retrieved successfully.",
            "data": serializer.data,
        })

    def patch(self, request, pk):
        message = self.get_object(pk)

        if not message:
            return Response(
                {
                    "message": "Message not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MessageSerializer(
            message,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            message = serializer.save()

            return Response({
                "message": "Message updated successfully.",
                "data": MessageSerializer(
                    message
                ).data,
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        message = self.get_object(pk)

        if not message:
            return Response(
                {
                    "message": "Message not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        message.delete()

        return Response({
            "message": "Message deleted successfully."
        })


class MarkMessageAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        message = Message.objects.filter(
            pk=pk
        ).first()

        if not message:
            return Response(
                {
                    "message": "Message not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        message.status = Message.Status.READ
        message.read_at = timezone.now()
        message.save(
            update_fields=[
                "status",
                "read_at",
                "updated_at",
            ]
        )

        return Response({
            "message": "Message marked as read.",
            "data": MessageSerializer(message).data,
        })