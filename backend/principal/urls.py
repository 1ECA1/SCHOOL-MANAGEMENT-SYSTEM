from django.urls import path

from .views import (
    PrincipalListCreateView,
    PrincipalDetailView,
)


urlpatterns = [
    path(
        "",
        PrincipalListCreateView.as_view(),
        name="principal-list-create",
    ),
    path(
        "<int:pk>/",
        PrincipalDetailView.as_view(),
        name="principal-detail",
    ),
]