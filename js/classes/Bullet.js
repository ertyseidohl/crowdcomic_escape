;(function(exports){
	var Bullet = function(_, settings){

		var _in = _.coq.inputter;
		var _cl = _.coq.collider;
		var _en = _.coq.entities;
		var speed = 7;

		var defaults = {
			"pos": {"x": 0, "y": 0},
			"size": {"x": 5, "y": 10},
			"angle": 0,
			"type" : 0,
			"emitter" : false
		};

		for (var i in defaults){
			this[i] = typeof(settings[i]) == "undefined" ? defaults[i] : settings[i];
		}

		this.zindex = 1200;

		this.boundingBox = _.coq.collider.CIRCLE;

		this.draw = function(ctx){
			if (!this.visible) return;
			this.visible = false;
			if (this.type == 1){
				ctx.fillStyle = _.settings.color_bullet_human;
			} else {
				ctx.fillStyle = _.settings.color_bullet_osac;
			}
			ctx.beginPath();
			ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x / 2, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fill();
		};

		this.update = function(){
			this.visible = true;
			this.pos.x += speed * Math.cos(this.angle);
			this.pos.y += speed * Math.sin(this.angle);
		};

		this.collision = function(other){
			if (other instanceof GameCollisionBox){
				_en.destroy(this);
			}
			if (other instanceof GameDoor && !other.open) {
				_en.destroy(this);
			}
			if (other instanceof Osacian && other !== this.emitter) {
				other.hitByBullet(this.emitter);
				_en.destroy(this);
			}
			if (other instanceof GamePlayer && this.type == 2) {
				other.hitByBullet(this.emitter);
				_en.destroy(this);
			}
		};
	}

	exports.Bullet = Bullet;

})(this);
