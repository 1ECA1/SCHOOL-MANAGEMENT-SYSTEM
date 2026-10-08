from django.urls import path

from .views import (
    TeacherListCreateView,
    TeacherDetailView,
    TeacherSubjectListCreateView,
    TeacherSubjectDetailView,
    ClassTeacherListCreateView,
    ClassTeacherDetailView,
    MyTeacherSubjectListView,
    MyClassTeacherListView,
)


urlpatterns = [

    # Teachers
    path(
        "",
        TeacherListCreateView.as_view(),
        name="teacher-list-create",
    ),

    path(
        "<int:pk>/",
        TeacherDetailView.as_view(),
        name="teacher-detail",
    ),

     # =====================================================
    # TEACHER PORTAL
    # =====================================================

    path(
        "my-subjects/",
        MyTeacherSubjectListView.as_view(),
        name="my-teacher-subjects",
    ),

    path(
        "my-classes/",
        MyClassTeacherListView.as_view(),
        name="my-class-teacher-assignments",
    ),

    # Teacher Subjects
    path(
        "assign-subject/",
        TeacherSubjectListCreateView.as_view(),
        name="teacher-subject-list-create",
    ),

    path(
        "assign-subject/<int:pk>/",
        TeacherSubjectDetailView.as_view(),
        name="teacher-subject-detail",
    ),

    # Class Teachers
    path(
        "assign-class/",
        ClassTeacherListCreateView.as_view(),
        name="class-teacher-list-create",
    ),

    path(
        "assign-class/<int:pk>/",
        ClassTeacherDetailView.as_view(),
        name="class-teacher-detail",
    ),
]