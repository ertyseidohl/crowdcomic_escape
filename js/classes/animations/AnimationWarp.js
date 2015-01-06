;(function(exports){
	var AnimationWarp = function(_, settings){

		this.scenes = [
			"waiting for warp"
		];

		this.keyFrames = [0];

		this.stars = [];
		this.driftSpeed = -0.2;
		this.numStars = 200;

		for(var i = 0; i < this.numStars; i++){
			this.stars.push(new Star(Math.random() * (800), Math.random() * 600, (Math.random() * 3) + 1));
		}

		this.update = function(){
			for(var i = 0; i < this.stars.length; i++){
				this.stars[i].x += this.driftSpeed;
				if(this.stars[i].x < 0){
					this.stars[i].x = 800;
				}
			}
		}

		this.draw = function(ctx, frame, scene){
			var sceneFrame = (frame - this.keyFrames[scene]);
			var sceneProgress = (sceneFrame / (this.keyFrames[scene + 1] - this.keyFrames[scene]));
			ctx.strokeStyle = _.settings.color_star;
			ctx.beginPath();
			for(var i = 0; i < this.stars.length; i++){
				ctx.moveTo(this.stars[i].x, this.stars[i].y);
				ctx.lineTo(this.stars[i].x + this.stars[i].size, this.stars[i].y + this.stars[i].size);
				ctx.moveTo(this.stars[i].x + this.stars[i].size, this.stars[i].y);
				ctx.lineTo(this.stars[i].x, this.stars[i].y + this.stars[i].size);
			}
			ctx.stroke();
			//draw The Orion
			ctx.strokeStyle = _.settings.color_ship;
			ctx.fillStyle = _.settings.color_ship_fill;
			//outside
			ctx.beginPath();
			ctx.moveTo(300, 275); //start
			ctx.lineTo(450, 275); //top
			ctx.lineTo(500, 300); //viewport
			ctx.lineTo(500, 325); //nose
			ctx.lineTo(450, 325); //helm bottom
			ctx.lineTo(425, 350); //stem
			ctx.lineTo(325, 450); //keel
			ctx.lineTo(300, 325); //keel aft
			ctx.lineTo(300, 275); //aft
			ctx.fill();
			//viewport
			ctx.moveTo(450, 325);
			ctx.lineTo(465, 325);
			ctx.lineTo(425, 425);
			ctx.lineTo(387, 387);
			ctx.fill();
			ctx.stroke();
			//wing
			ctx.beginPath();
			ctx.moveTo(325, 300); //start
			ctx.lineTo(425, 300); //top
			ctx.lineTo(400, 355); //slant
			ctx.lineTo(325, 300); //rear
			ctx.stroke();
		};
	};

	exports.AnimationWarp = AnimationWarp;
})(this);
