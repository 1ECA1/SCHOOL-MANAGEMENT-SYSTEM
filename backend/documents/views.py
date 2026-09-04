from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Document
from .serializers import DocumentSerializer


class DocumentListCreateView(generics.ListCreateAPIView):
    queryset = Document.objects.select_related(
        "school",
        "uploaded_by",
        "student",
        "staff",
    ).all()

    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.select_related(
        "school",
        "uploaded_by",
        "student",
        "staff",
    ).all()

    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]