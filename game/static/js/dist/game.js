class AcGameMenu {
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-single">
        单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-multi">
        多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-settings">
        设置
        </div>
    </div>
</div>        
`);
        this.hide();
        this.$single = this.$menu.find('.ac-game-menu-field-single');
        this.$multi = this.$menu.find('.ac-game-menu-field-multi');
        this.$settings = this.$menu.find('.ac-game-menu-field-settings');
        this.root.$ac_game.append(this.$menu);

        this.start();
    }

    start() {
        this.add_listeining_events();
    }

    add_listeining_events() {
        let outer = this;
        this.$single.click(function () {
            outer.hide();
            outer.root.playground.show(); 
        });
        this.$multi.click(function () {
            
        });
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        });
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;
        this.timedelta = 0;

    }

    start() {

    }

    update() {

    }

    on_destory() {

    }

    destory() {
        this.on_destory();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}
let last_timestamp;
let AC_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        }else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {

    }

    update() {
        this.render()
    }

    render() {
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 3;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destory();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;

        this.render();

    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.spend_time = 0;

        this.cur_skill = null;
        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        })
        this.playground.game_map.$canvas.mousedown(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (outer.cur_skill == "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null;
            }
        })

        $(window).keydown(function (e) {
            if (e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        })
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 10 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * Math.random();
            let vx = Math.sin(angle), vy = Math.cos(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if (this.radius < 10) {
            this.destory();
            return false;
        }

        this.damage_speed = this.playground.width * 1;
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);

    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() {
        this.spend_time += this.timedelta / 1000;
        if (!this.is_me && this.spend_time > 4 && Math.random() < 1 / 300) {
            let index = Math.floor(Math.random() * this.playground.players.length);
            let player = this.playground.players[index];
            this.shoot_fireball(player.x, player.y);
        }

        if (this.damage_speed > this.eps) {
            this.vx = 0, this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;

            this.damage_speed *= this.friction;

        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }

        this.render();
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destory() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;

    }

    strat() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destory();
            return false;
        } else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }

        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destory();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        if (this.get_dist(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground">
</div>        
`);
        this.hide();
        this.start();
    }

    get_random_color() {
        let colors = ["green", "blue", "pink", "grey", "red"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {

    }

    show() {
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
    }

    hide() {
        this.$playground.hide();
    }
}class Settings {
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

    this.$login_acwing = this.$settings.find(".ac-game-settings-acwing img");

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

    this.$login_acwing.click(function (resp) {
      let outer = this;
      $.ajax({
        url: "/settings/web/apply_auth",
        type:"GET",
        success: function (resp) {
          if (resp.result === "success"){
            window.location.replace(resp.url);
          }
        }
      })
    })
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
      url: "https://app6796.acapp.acwing.com.cn/settings/getinfo",
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
export class AcGame{
    constructor(id, AcwingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcwingOS = AcwingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start(){
        
    }
}