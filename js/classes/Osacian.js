;(function(exports){
	var Osacian = function(_, settings){

		var _in = _.coq.inputter;
		var _cl = _.coq.collider;
		var _en = _.coq.entities;

		var defaults = {
			"pos": {"x": 0, "y": 0},
			"size": {"x": 25, "y": 25},
			"vec": {"x": 0, "y": 0},
			"acceleration": 0.4,
			"friction": 0.87,
			"maxSpeed": 10,
			"zindex": 100,
			"style": "human",
			"visible": true,
			"team" : 1
		};

		for (var i in defaults){
			this[i] = typeof(settings[i]) == "undefined" ? defaults[i] : settings[i];
		}

		this.shotCooldown = 0;
		this.shotCooldownMax = 30;

		this.health = 3;

		this.zindex = 1000;

		this.boundingBox = _.coq.collider.CIRCLE;

		this.player = null;

		this.speed = 0.5;
		this.maxSpeed = 3;

		this.wallCollisions = {
			"up": false,
			"down": false,
			"left": false,
			"right": false
		};

		this.draw = function(ctx){
			if(!this.visible) return;
			this.visible = false;
			ctx.strokeStyle = _.settings.color_osacian;
			ctx.beginPath();
			ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x / 2, 0, 2*Math.PI);
			ctx.closePath();
			ctx.stroke();
			if (this.player) {
				ctx.fillStyle = _.settings.color_osacian;
				ctx.fill();
			}
		};

		this.update = function(){
			this.visible = true;
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

			if (this.player) {
				this.dist = Math.sqrt(Math.pow(this.player.pos.y - this.pos.y, 2) + Math.pow(this.player.pos.x - this.pos.x, 2));
				if (this.dist > 50) {
					var angle = Math.atan2(this.player.pos.y - this.pos.y, this.player.pos.x - this.pos.x);
					this.vec.x += this.speed * Math.cos(angle);
					this.vec.y += this.speed * Math.sin(angle);
				}

				if (this.shotCooldown > 0) {
					this.shotCooldown --;
				}
				if (this.shotCooldown == 0) {
					this.shotCooldown = this.shotCooldownMax;
					_en.create(Bullet, {
						pos : {
							x: this.pos.x + (this.size.x / 2),
							y: this.pos.y + (this.size.y / 2)
						},
						angle : Math.atan2(
							this.player.pos.y + this.player.size.y / 2 - this.pos.y - (this.size.y / 2),
							this.player.pos.x + this.player.size.x / 2 - this.pos.x - (this.size.x / 2)
						),
						type : 2,
						emitter: this
					});
				}
			}

			this.vec.x *= this.friction;
			this.vec.y *= this.friction;

			this.vec.x = Math.min(this.vec.x, this.maxSpeed);
			this.vec.y = Math.min(this.vec.y, this.maxSpeed);
		};

		this.collision = function(other){
			if(other instanceof GameCollisionBox || other instanceof Osacian){
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

		this.hitByBullet = function(player){
			if (player) {
				this.noticePlayer(player);
			}
			if (this.team) {
				game.alertOsacians(this.team);
			}
			this.health --;
			if (this.health === 0) {
				_en.destroy(this);
			}
		}

		this.noticePlayer = function(player) {
			this.player = player;
			this.shotCooldown = Math.floor(Math.random() * this.shotCooldownMax);
		}
	}

	exports.Osacian = Osacian;

})(this);
