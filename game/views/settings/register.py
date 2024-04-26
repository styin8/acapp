from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login
from game.models.player.player import Player


def register(request):
    data = request.GET
    username = data.get("username", "")
    password = data.get("password", "")
    if not username or not password:
        return JsonResponse({
            "result": "用户名或密码为空",
        })

    if User.objects.filter(username=username).exists():
        return JsonResponse({
            "result": "该用户名已存在",
        })

    confirm_password = data.get("confirm_password", "")
    if password != confirm_password:
        return JsonResponse({
            "result": "两次密码不一致",
        })

    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(
        user=user, photo="https://img.zcool.cn/community/01e8db5e529be7a80120a89532a50d.jpg")
    login(request, user)

    return JsonResponse({
        "result": "success",
    })
