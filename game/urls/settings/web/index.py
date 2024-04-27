from django.urls import path
from game.views.settings.web.apply_auth import apply_auth
from game.views.settings.web.receive_auth import receive_auth

urlpatterns=[
    path("apply_auth", apply_auth, name="settings_web_apply_auth"),
    path("receive_auth", receive_auth, name="setting_web_receive_auth"),
]