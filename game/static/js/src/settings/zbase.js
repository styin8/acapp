class Settings {
  constructor(root) {
    this.root = root;
    this.platform = "WEB";
    this.username = "";
    this.photo = "";
    if (this.root.AcwingOS) this.platform = "ACAPP";
    this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
      <div class="ac-game-settings-title">登录</div>
      <div class="ac-game-settings-username">
        <div class="ac-game-settings-item">
              <input type="text" placeholder="用户名">
          </div>
      </div>
      <div class="ac-game-settings-password">
		<div class="ac-game-settings-item">
			<input type="password" placeholder="密码">
		</div>
      </div>
	  <div class="ac-game-settings-submit">
		<div class="ac-game-settings-item">
			<button>登录</button>
		</div>
      </div>
      <div class="ac-game-settings-error-messages"></div>
      <div class="ac-game-settings-option">注册</div>
      <br>
      <div class="ac-game-settings-acwing">
        <img width="30" src="/static/image/settings/acapp_logo.png"/>
        <br>
        <div>AcWing一键登录</div>
      </div>
    </div>
    <div class="ac-game-settings-register">
      <div class="ac-game-settings-title">注册</div>
      <div class="ac-game-settings-username">
        <div class="ac-game-settings-item">
              <input type="text" placeholder="用户名">
          </div>
      </div>
      <div class="ac-game-settings-password ac-game-settings-password-first">
        <div class="ac-game-settings-item">
            <input type="password" placeholder="密码">
        </div>
      </div>
      <div class="ac-game-settings-password ac-game-settings-password-second">
        <div class="ac-game-settings-item">
            <input type="password" placeholder="确认密码">
        </div>
      </div>
      <div class="ac-game-settings-submit">
        <div class="ac-game-settings-item">
            <button>注册</button>
        </div>
      </div>
      <div class="ac-game-settings-error-messages"></div>
      <div class="ac-game-settings-option">登录</div>
    </div>
	
</div>
`);
    this.root.$ac_game.append(this.$settings);
    this.hide();
    this.$login = this.$settings.find(".ac-game-settings-login");
    this.$login_username = this.$login.find(".ac-game-settings-username input");
    this.$login_password = this.$login.find(".ac-game-settings-password input");
    this.$login_submit = this.$login.find(".ac-game-settings-submit button");
    this.$login_error_messages = this.$login.find(".ac-game-settings-error-messages");
    this.$login_register = this.$login.find(".ac-game-settings-option");

    this.$login.hide();
    this.$register = this.$settings.find(".ac-game-settings-register");
    this.$register_username = this.$register.find(".ac-game-settings-username input");
    this.$register_password = this.$register.find(".ac-game-settings-password-first input");
    this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
    this.$register_submit = this.$register.find(".ac-game-settings-submit button");
    this.$register_error_messages = this.$register.find(".ac-game-settings-error-messages");
    this.$register_login = this.$register.find(".ac-game-settings-option");

    this.$register.hide();
    this.start();
  }

  start() {
    this.getinfo();
    this.add_listening_events();
  }



  add_listening_events() {
    this.add_listening_events_login();
    this.add_listening_events_register();
  }

  add_listening_events_login() {
    let outer = this;
    this.$login_register.click(function () {
      outer.register();
    })

    this.$login_submit.click(function () {
      outer.login_on_remote();
    })

  }

  login_on_remote() {
    let outer = this;
    this.$login_error_messages.empty();
    $.ajax({
      url: "/settings/login",
      type: "GET",
      data: {
        username: this.$login_username.val(),
        password: this.$login_password.val(),
      },
      success: function (resp) {
        if (resp.result === "success") {
          location.reload();
        } else {
          outer.$login_error_messages.html(resp.result);
        }
      }
    })
  }

  register_on_remote() {
    let outer = this;
    this.$register_error_messages.empty();

    $.ajax({
      url: "/settings/register",
      type: "GET",
      data: {
        username: this.$register_username.val(),
        password: this.$register_password.val(),
        confirm_password: this.$register_password_confirm.val(),
      },
      success: function (resp) {
        if (resp.result === "success") {
          location.reload();
        } else {
          outer.$register_error_messages.html(resp.result);
        }
      }
    })
  }

  logout_on_remote() {
    if (this.platform === "ACAPP") return false;

    let outer = this;
    $.ajax({
      url: "/settings/logout",
      type: "GET",
      success: function (resp) {
        if (resp.result === "success") {
          location.reload();
        }
      }
    })
  }

  add_listening_events_register() {
    let outer = this;
    this.$register_login.click(function () {
      outer.login();
    })

    this.$register_submit.click(function () {
      outer.register_on_remote();
    })

  }
  login() {
    this.$register.hide();
    this.$login.show();
  }

  register() {
    this.$login.hide();
    this.$register.show();
  }
  getinfo() {
    let outer = this;
    $.ajax({
      url: "/settings/getinfo",
      type: "GET",
      data: {
        platform: outer.platform,
      },
      success: function (resp) {
        if (resp.result === "success") {
          outer.hide();
          outer.root.menu.show();
          outer.username = resp.username;
          outer.photo = resp.photo;
        } else {
          outer.show();
          outer.login();
        }
      },
    });
  }


  hide() {
    this.$settings.hide();
  }

  show() {
    this.$settings.show();
  }
}
