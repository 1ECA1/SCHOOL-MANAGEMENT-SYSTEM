# from django.urls import path

# from .views import (
#     LoginView,
#     ProfileView,
#     RegisterView,
# )


# urlpatterns = [
#     path(
#         "login/",
#         LoginView.as_view(),
#         name="login",
#     ),

#     path(
#         "register/",
#         RegisterView.as_view(),
#         name="register",
#     ),

#     path(
#         "profile/",
#         ProfileView.as_view(),
#         name="profile",
#     ),
# ]

from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
)


urlpatterns = [
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]