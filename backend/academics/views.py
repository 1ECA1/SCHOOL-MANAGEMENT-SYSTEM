from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Department,
    Subject,
    AcademicSection,
)

from .serializers import (
    SchoolSerializer,
    AcademicSessionSerializer,
    TermSerializer,
    ClassLevelSerializer,
    DepartmentSerializer,
    SubjectSerializer,
    AcademicSectionSerializer,
)


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]


class AcademicSessionViewSet(viewsets.ModelViewSet):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
    permission_classes = [IsAuthenticated]


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated]


class ClassLevelViewSet(viewsets.ModelViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_classes = [IsAuthenticated]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]



class AcademicSectionViewSet(viewsets.ModelViewSet):
    queryset = AcademicSection.objects.all()
    serializer_class = AcademicSectionSerializer
    permission_classes = [IsAuthenticated]