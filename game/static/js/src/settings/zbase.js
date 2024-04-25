class Settings {
  constructor(root) {
    this.root = root;
    this.platform = "WEB";
    if (this.root.AcwingOS) this.platform = "ACAPP";

    this.start();
  }

  login() {}

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
          outer.login();
        }
      },
    });
  }

  start() {
    this.getinfo();
  }

  hide() {}

  show() {}
}
