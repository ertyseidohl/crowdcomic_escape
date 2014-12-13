;(function(exports){
	var AnimationStarScroll = function(_, settings){
		this.noCollision = true;

		this.scenes = [
			"stars_scrolling_1",
			"stars_scrolling_2"
		];

		this.keyFrames = [0, 1000];

		this.stars = [];
		this.maxStars = 200;
		this.starSpeed = 0.2;
		for(var s = 0; s < this.maxStars; s++){
			this.stars.push(new Star(Math.random() * 800, Math.random() * 600, Math.random() * 3 + 1, Math.random() * this.starSpeed + 0.1));
		}

		this.update = function(){
			for(var i = 0; i < this.stars.length; i++){
				this.stars[i].y += this.stars[i].speed;
				if(this.stars[i].y > 600){
					this.stars[i].y = -10;
					this.stars[i].x = Math.random() * 800;
				}
			}
		}

		this.draw = function(ctx, frame, scene){
			//starField
			ctx.strokeStyle = _.settings.color_star;
			ctx.beginPath();
			for(var i = 0; i < this.stars.length; i++){
				ctx.moveTo(this.stars[i].x, this.stars[i].y);
				ctx.lineTo(this.stars[i].x + this.stars[i].size, this.stars[i].y + this.stars[i].size);
				ctx.moveTo(this.stars[i].x + this.stars[i].size, this.stars[i].y);
				ctx.lineTo(this.stars[i].x, this.stars[i].y + this.stars[i].size);
			}
			ctx.stroke();
		};
	};

	exports.AnimationStarScroll = AnimationStarScroll;
})(this);
