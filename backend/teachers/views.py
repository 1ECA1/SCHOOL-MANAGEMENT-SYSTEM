from rest_framework import generics

from .models import Teacher, TeacherSubject, ClassTeacher

from .serializers import (
    TeacherSerializer,
    TeacherSubjectSerializer,
    ClassTeacherSerializer,
)


class TeacherListCreateView(generics.ListCreateAPIView):

    queryset = Teacher.objects.select_related(
        "school",
        "department",
    ).all()

    serializer_class = TeacherSerializer


class TeacherDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Teacher.objects.select_related(
        "school",
        "department",
    ).all()

    serializer_class = TeacherSerializer


class TeacherSubjectListCreateView(
    generics.ListCreateAPIView
):

    queryset = TeacherSubject.objects.select_related(
        "teacher",
        "subject",
        "class_level",
    ).all()

    serializer_class = TeacherSubjectSerializer


class TeacherSubjectDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = TeacherSubject.objects.select_related(
        "teacher",
        "subject",
        "class_level",
    ).all()

    serializer_class = TeacherSubjectSerializer


class ClassTeacherListCreateView(
    generics.ListCreateAPIView
):

    queryset = ClassTeacher.objects.select_related(
        "teacher",
        "class_level",
        "academic_session",
    ).all()

    serializer_class = ClassTeacherSerializer


class ClassTeacherDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = ClassTeacher.objects.select_related(
        "teacher",
        "class_level",
        "academic_session",
    ).all()

    serializer_class = ClassTeacherSerializer