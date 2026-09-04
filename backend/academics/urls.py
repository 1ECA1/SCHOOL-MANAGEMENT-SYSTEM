from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    SchoolViewSet,
    AcademicSessionViewSet,
    TermViewSet,
    ClassLevelViewSet,
    DepartmentViewSet,
    SubjectViewSet,
    AcademicSectionViewSet,
)


router = DefaultRouter()

router.register(
    "schools",
    SchoolViewSet,
    basename="school",
)

router.register(
    "sessions",
    AcademicSessionViewSet,
    basename="academic-session",
)

router.register(
    "terms",
    TermViewSet,
    basename="term",
)

router.register(
    "class-levels",
    ClassLevelViewSet,
    basename="class-level",
)

router.register(
    "departments",
    DepartmentViewSet,
    basename="department",
)

router.register(
    "subjects",
    SubjectViewSet,
    basename="subject",
)

router.register(
    "academic-sections",
    AcademicSectionViewSet,
    basename="academic-section",
)


urlpatterns = [
    path("", include(router.urls)),
]