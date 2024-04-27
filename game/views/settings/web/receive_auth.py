from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from django.contrib.auth import login
from game.models.player.player import Player
import random

def receive_auth(request):
    data = request.GET
    code = data.get("code")
    state = data.get("state")
    if not cache.has_key(state):
        return redirect("index")
    
    cache.delete(state)

    appid = "6796"
    secrity = "b37bb8f5f4aa4bbc90ab5357b1c10282"
    acc_url = "https://www.acwing.com/third_party/api/oauth2/access_token"
    acc_params = {
        "code":code,
        "appid":appid,
        "secret":secrity,
    }

    resp = requests.get(acc_url, params=acc_params).json()
    if resp.get("errcode", "") == 40001:
        return redirect("index")

    access_token = resp.get("access_token")
    openid = resp.get("openid")

    player = Player.objects.filter(openid=openid)
    if player.exists():
        login(request, player[0].user)
        return redirect("index")

    getinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    getinfo_params = {
        "access_token":access_token,
        "openid":openid,
    }
    info = requests.get(getinfo_url, params=getinfo_params).json()
    if resp.get("errcode", "") == 40004:
        return redirect("index")

    username = info.get("username")
    photo = info.get("photo")

    while User.objects.filter(username=username).exists():
        username += str(random.randint(0,9))
    
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo)
    login(request, user)
    return redirect("index")