;(function(exports){
	var GameDoor = function(_, settings){
		for (var i in settings.sensor) {
			this[i] = settings.sensor[i];
		}

		this.door = settings.door;
		this.locked = settings.locked;
		this.orientation = settings.orientation || "vertical";
		this.triggered = false;
		this.opening = 0;
		this.openTime = 10;
		this.waiting = 0;
		this.waitTime = 30;

		this.collision = function(other){
			if(other instanceof GamePlayer){
				if(!this.locked && !this.triggered){
					this.triggered = true;
					this.opening = this.openTime;
					this.waiting = 0;
				}
			}
		};
		this.uncollision = function(other){
			if(other instanceof GamePlayer){
				if(!this.locked){
					this.triggered = false;
					this.opening = - this.openTime;
					this.waiting = this.waitTime;
				}
			}
		};
		this.update = function(){
			if(this.opening > 0){
				this.opening --;
			} else if(this.waiting > 0){
				this.waiting --;
			} else if(this.opening < 0){
				this.opening ++;
			}
		};
		this.draw = function(ctx){
			if(_.GALAXY.debugMode) {
				ctx.strokeStyle = "#ff0000";
				ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
			}
			ctx.strokeStyle = _.settings.color_orion;
			var rects = this.getDoorRectangles();
			if(rects) {
				rects.forEach(function(rect) {
					ctx.strokeRect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
				});
			}
		};
		this.getDoorRectangles = function(){
			if(this.orientation == "vertical"){
				if(this.opening === 0 && !this.triggered && this.waiting === 0){
					return [
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y
							},
							size: {
								x: this.door.size.x,
								y: this.door.size.y / 2
							}
						},
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y + this.door.size.y
							},
							size: {
								x: this.door.size.x,
								y: - this.door.size.y / 2
							}
						}
					];
				} else if(this.opening > 0){
					return [
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y
							},
							size: {
								x: this.door.size.x,
								y: (this.door.size.y / 2) * (this.opening / this.openTime)
							}
						},
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y + this.door.size.y
							},
							size: {
								x: this.door.size.x,
								y: - (this.door.size.y / 2) * (this.opening / this.openTime)
							}
						}
					];
				} else if(this.opening < 0 && this.waiting === 0){
					return [
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y
							},
							size: {
								x: this.door.size.x,
								y: (this.door.size.y / 2) * (1 + (this.opening / this.openTime))
							}
						},
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y + this.door.size.y
							},
							size: {
								x: this.door.size.x,
								y: - (this.door.size.y / 2) * (1 + (this.opening / this.openTime))
							}
						}
					];
				}
			} else if(this.orientation == "horizontal"){
				if(this.opening === 0 && !this.triggered && this.waiting === 0){
					return [
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y
							},
							size: {
								x: this.door.size.x / 2,
								y: this.door.size.y
							}
						},
						{
							pos: {
								x: this.door.pos.x + this.door.size.x,
								y: this.door.pos.y,
							},
							size: {
								x: - this.door.size.x / 2,
								y: this.door.size.y

							}
						}
					];
				} else if(this.opening > 0){
					return [
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y,
							}, size: {
								x: (this.door.size.x / 2) * (this.opening / this.openTime),
								y: this.door.size.y
							}
						},
						{
							pos: {
								x: this.door.pos.x + this.door.size.x,
								y: this.door.pos.y,
							}, size: {
								x: - (this.door.size.x / 2) * (this.opening / this.openTime),
								y: this.door.size.y
							}
						}
					];
				} else if(this.opening < 0 && this.waiting === 0){
					return [
						{
							pos: {
								x: this.door.pos.x,
								y: this.door.pos.y
							}, size: {
								x: (this.door.size.x / 2) * (1 + (this.opening / this.openTime)),
								y: this.door.size.y
							}
						},
						{
							pos: {
								x: this.door.pos.x + this.door.size.x,
								y: this.door.pos.y
							},
							size: {
								x: - (this.door.size.x / 2) * (1 + (this.opening / this.openTime)),
								y: this.door.size.y
							}
						}
					];
				}
			}
		};

		this.getLightSegments = function() {
			var rects = this.getDoorRectangles();
			if(!rects) return [];
			rects = rects.map(function(rect) {
				return [
					{
						x1: rect.pos.x,
						y1: rect.pos.y,
						x2: rect.pos.x + rect.size.x,
						y2: rect.pos.y
					},
					{
						x1: rect.pos.x + rect.size.x,
						y1: rect.pos.y,
						x2: rect.pos.x + rect.size.x,
						y2: rect.pos.y + rect.size.y
					},
					{
						x1: rect.pos.x + rect.size.x,
						y1: rect.pos.y + rect.size.y,
						x2: rect.pos.x,
						y2: rect.pos.y + rect.size.y
					},
					{
						x1: rect.pos.x,
						y1: rect.pos.y + rect.size.y,
						x2: rect.pos.x,
						y2: rect.pos.y
					}
				];
			});
			var rtn = [];
			rtn = rects.concat.apply(rtn, rects);
			return rtn;
		};
	};

	exports.GameDoor = GameDoor;
})(this);
