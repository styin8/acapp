from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_auth(requset):
    appid = "6796"
    redirect_uri = quote("https://app6796.acapp.acwing.com.cn/settings/web/receive_auth")
    scope = "userinfo"
    state = get_state()
    cache.set(state, True, 7200)
    return JsonResponse({
        "result": "success",
        "url": "https://www.acwing.com/third_party/api/oauth2/web/authorize/" + f"?appid={appid}&redirect_uri={redirect_uri}&scope={scope}&state={state}"
    })
