;(function(exports){
	var GamePlayer = function(_, settings){

		var _in = _.coq.inputter;
		var _cl = _.coq.collider;
		var _en = _.coq.entities;
		var _ren = _.coq.renderer;

		var defaults = {
			"pos": {"x": 0, "y": 0},
			"size": {"x": 0, "y": 0},
			"vec": {"x": 0, "y": 0},
			"acceleration": 0.4,
			"friction": 0.87,
			"maxSpeed": 10,
			"zindex": 100,
			"style": "human",
			"visible": true
		};

		for (var i in defaults){
			this[i] = typeof(settings[i]) == "undefined" ? defaults[i] : settings[i];
		}

		this.zindex = 1000;

		this.boundingBox = _.coq.collider.CIRCLE;

		this.wallCollisions = {
			"up": false,
			"down": false,
			"left": false,
			"right": false
		};

		this.health = 2;

		this.light = settings.playerLight;

		this.shotCooldown = 0;
		this.shotCooldownMax = 20;

		this.draw = function(ctx){
			if(!this.visible) return;
			this.visible = false;
			ctx.strokeStyle = _.settings.color_player_human;
			ctx.lineWidth = this.health * 2;
			ctx.beginPath();
			ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x / 2, 0, 2*Math.PI);
			ctx.closePath();
			ctx.stroke();
		};

		this.update = function(){
			this.visible = true;
			if(_in.state(_in.UP_ARROW)){
				this.vec.y -= this.acceleration;
				if(this.vec.y < -this.maxSpeed){
					this.vec.y = -this.maxSpeed;
				}
			}
			if(_in.state(_in.DOWN_ARROW)){
				this.vec.y += this.acceleration;
				if(this.vec.y > this.maxSpeed){
					this.vec.y = this.maxSpeed;
				}
			}
			if(_in.state(_in.LEFT_ARROW)){
				this.vec.x -= this.acceleration;
				if(this.vec.x < -this.maxSpeed){
					this.vec.x = -this.maxSpeed;
				}
			}
			if(_in.state(_in.RIGHT_ARROW)){
				this.vec.x += this.acceleration;
				if(this.vec.x > this.maxSpeed){
					this.vec.x = this.maxSpeed;
				}
			}
			if (this.shotCooldown > 0) {
				this.shotCooldown --;
			}
			if (_in.state(_in.MOUSE_LEFT)) {
				if (this.shotCooldown == 0) {
					this.shotCooldown = this.shotCooldownMax;
					_en.create(Bullet, {
						pos : {
							x: this.pos.x + (this.size.x / 2),
							y: this.pos.y + (this.size.y / 2)
						},
						angle : Math.atan2(
							_in.mouse.y - this.pos.y - (this.size.y / 2),
							_in.mouse.x - this.pos.x - (this.size.x / 2)
						),
						type : 1,
						emitter : this
					});
				}
			}
			if((this.wallCollisions.left === false && this.vec.x < 0) ||
			(this.wallCollisions.right === false && this.vec.x > 0)){
				if(this.pos.x + this.vec.x >= 0 && this.pos.x + this.vec.x + this.size.y <= _.coq.renderer.worldSize.x){
					this.pos.x += this.vec.x;
				}
			}
			if((this.wallCollisions.up === false && this.vec.y < 0) ||
			(this.wallCollisions.down === false && this.vec.y > 0)){
				if(this.pos.y + this.vec.y >= 0 && this.pos.y + this.vec.y + this.size.y <= _.coq.renderer.worldSize.y){
					this.pos.y += this.vec.y;
				}
			}
			this.vec.x *= this.friction;
			this.vec.y *= this.friction;

			if (this.light) {
				this.light.pos = {
					x: this.pos.x + this.size.x / 2,
					y: this.pos.y + this.size.y  / 2
				};
			}

			//leeeeeeeroy
			var osacians = _.coq.entities.all(Osacian);
			for (var o_i = 0; o_i < osacians.length; o_i++) {
				var o = osacians[o_i];
				if (Math.abs(o.pos.x - this.pos.x) + Math.abs(o.pos.y - this.pos.y) < 200) {
					o.noticePlayer(this);
				}
			}

		};

		this.collision = function(other){
			if(other instanceof GameCollisionBox){
				other.collided = true;
				//LEFT
				if(this.pos.x <= other.pos.x + other.size.x &&
					this.pos.x + this.size.x / 2 > other.pos.x + other.size.x){
					while(_cl.isIntersecting(this, other)) {
						this.pos.x += 1;
						this.vec.x = 0;
					}
				}
				//RIGHT
				if(this.pos.x + this.size.x >= other.pos.x &&
					this.pos.x + this.size.x / 2 < other.pos.x){
					while(_cl.isIntersecting(this, other)) {
						this.pos.x -= 1;
						this.vec.x = 0;
					}
				}
				//UP
				if(this.pos.y <= other.pos.y + other.size.y &&
					this.pos.y + this.size.y / 2 > other.pos.y){
					while(_cl.isIntersecting(this, other)) {
						this.pos.y += 1;
						this.vec.y = 0;
					}
				}
				//DOWN
				if(this.pos.y + this.size.y >= other.pos.y &&
					this.pos.y + this.size.y / 2 < other.pos.y){
					while(_cl.isIntersecting(this, other)) {
						this.pos.y -= 1;
						this.vec.y = 0;
					}
				}
			}
		};

		this.uncollision = function(other){
			if(other instanceof GameCollisionBox){
				other.collided = false;
				if(other == this.wallCollisions.up) this.wallCollisions.up = false;
				if(other == this.wallCollisions.down) this.wallCollisions.down = false;
				if(other == this.wallCollisions.left) this.wallCollisions.left = false;
				if(other == this.wallCollisions.right) this.wallCollisions.right = false;
			}
		};

		this.hitByBullet = function(_fals) {
			//this.health -= 1;
			if (this.health == 0) {
				_.changeGameState("game lost");
			}
		};
	}

	exports.GamePlayer = GamePlayer;

})(this);
