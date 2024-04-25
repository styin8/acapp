class Settings {
  constructor(root) {
    this.root = root;
    this.platform = "WEB";
    if (this.root.AcwingOS) this.platform = "ACAPP";
    this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
    </div>
    <div class="ac-game-settings-register">
    </div>
</div>
`);
    this.root.$ac_game.append(this.$settings);
    this.hide();
    this.$login = this.$settings.find(".ac-game-settings-login");
    this.$login.hide();
    this.$register = this.$settings.find(".ac-game-settings-register");
    this.$register.hide();
    this.start();
  }

  login() {
    this.$login.show();
  }

  register() {}
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
        } else {
          outer.show();
          outer.login();
        }
      },
    });
  }

  start() {
    this.getinfo();
  }

  hide() {
    this.$settings.hide();
  }

  show() {
    this.$settings.show();
  }
}
