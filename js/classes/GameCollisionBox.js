;(function(exports){
	var GameCollisionBox = function(_, settings){

		this.CollisionBox = _.coq.collider.RECTANGLE;
		this.collided = false;

		var defaults = {
			"pos": {"x": 0, "y": 0},
			"size": {"x": 0, "y": 0}
		};

		for (var i in defaults){
			this[i] = typeof(settings[i]) == "undefined" ? defaults[i] : settings[i];
		}

		this.getLightSegments = function() {
			return [
				{
					x1: this.pos.x,
					y1: this.pos.y,
					x2: this.pos.x + this.size.x,
					y2: this.pos.y
				},
				{
					x1: this.pos.x + this.size.x,
					y1: this.pos.y,
					x2: this.pos.x + this.size.x,
					y2: this.pos.y + this.size.y
				},
				{
					x1: this.pos.x + this.size.x,
					y1: this.pos.y + this.size.y,
					x2: this.pos.x,
					y2: this.pos.y + this.size.y
				},
				{
					x1: this.pos.x,
					y1: this.pos.y + this.size.y,
					x2: this.pos.x,
					y2: this.pos.y
				}
			];
		};

		this.draw = function(ctx){
			if(_.GALAXY.debugMode){
				ctx.strokeStyle = "ff0000";
				ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
			}
			if(_.GALAXY.debugMode && this.collided){
				ctx.fillStyle = "ff0000";
				ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
			}
		};
	};
	exports.GameCollisionBox = GameCollisionBox;
})(this);
