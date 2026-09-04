"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Accounts
    path(
        "api/",
        include("accounts.urls"),
    ),

    # Finance
    path("api/finance/", include("finance.urls")),

    # Communication 
    path(
    "api/communication/",
    include("communication.urls"),
),

    # Attendance
    path("api/attendance/", include("attendance.urls")),
    
    # Result
    path("api/results/", include("results.urls")),
    
    #Student
    path("api/students/", include("students.urls")),

    # Report
    path("api/reports/", include("reports.urls")),

    # Noiffication
    path(
    "api/notifications/",
    include("notifications.urls"),
),

    # Teacher 
    path("api/teachers/", include("teachers.urls")),

    #Assignment
    path(
    "api/assignments/",
    include("assignments.urls"),
),

     # Academics
    path(
        "api/academics/",
        include("academics.urls"),
    ),

    # Library
    path(
    "api/library/",
    include("library.urls"),
),

    # Hotel
    path(
    "api/hostel/",
    include("hostel.urls"),
),

    # Document 
    path(
    "api/documents/",
    include("documents.urls"),
),

    # Audit
    path(
    "api/audit/",
    include("audit.urls"),
),


    # Examination
    path("api/examinations/", include("examinations.urls")),

    # Timetable
    path("api/timetable/", include("timetable.urls")),

    

    # JWT token refresh
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
