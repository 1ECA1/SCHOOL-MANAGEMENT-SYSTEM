from django.urls import path

from .views import (
    SchoolUserCreateView,
    SchoolUserDetailView,
    SchoolUserListView,
    OtherStaffListView,

    SuperAdminDashboardView,
    SchoolAdminDashboardView,
    

    SuperAdminSchoolAdminListView,
    SuperAdminCreateSchoolAdminView,
    SuperAdminSchoolAdminDetailView,
    SuperAdminEditSchoolAdminView,
)


urlpatterns = [
    # ========================================================
    # SCHOOL USER MANAGEMENT
    # ========================================================

    path(
        "users/",
        SchoolUserListView.as_view(),
        name="school-user-list",
    ),

    path(
        "users/create/",
        SchoolUserCreateView.as_view(),
        name="school-user-create",
    ),

    path(
        "users/<int:pk>/",
        SchoolUserDetailView.as_view(),
        name="school-user-detail",
    ),

    path(
        "users/other-staff/",
        OtherStaffListView.as_view(),
        name="other-staff-list",
    ),


    # ========================================================
    # SUPER ADMIN DASHBOARD
    # ========================================================

    path(
        "super-admin/dashboard/",
        SuperAdminDashboardView.as_view(),
        name="super-admin-dashboard",
    ),
    # ========================================================
    # SCHOOL ADMIN DASHBOARD
    # ========================================================

    path(
        "school-admin/dashboard/",
        SchoolAdminDashboardView.as_view(),
        name="school-admin-dashboard",
    ),


    # ========================================================
    # SUPER ADMIN - SCHOOL ADMIN MANAGEMENT
    # ========================================================

    path(
        "super-admin/school-admins/",
        SuperAdminSchoolAdminListView.as_view(),
        name="super-admin-school-admin-list",
    ),

    path(
        "super-admin/school-admins/create/",
        SuperAdminCreateSchoolAdminView.as_view(),
        name="super-admin-create-school-admin",
    ),

    path(
        "super-admin/school-admins/<int:pk>/",
        SuperAdminSchoolAdminDetailView.as_view(),
        name="super-admin-school-admin-detail",
    ),

    path(
        "super-admin/school-admins/<int:pk>/edit/",
        SuperAdminEditSchoolAdminView.as_view(),
        name="super-admin-edit-school-admin",
    ),
]