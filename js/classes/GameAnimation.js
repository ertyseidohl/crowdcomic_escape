;(function(exports){
	var GameAnimation = function(_, settings){
		this.noCollision = true;
		this.isStatic = true;

		this.callback = settings.callback;
		var clazz = settings.animation;
		this.animation = new clazz(_, settings);
		this.zindex = settings.zindex;

		this.frame = 0;
		this.scene = 0;

		this.restart = function(){
			this.frame = 0;
			this.scene = 0;
		};

		this.update = function(){
			this.frame ++;
			if(this.frame == this.animation.keyFrames[this.scene + 1]) this.scene ++;
			if(this.scene == this.animation.scenes.length){
				this.callback.apply(this, [this.animation]);
			}
			this.animation.update()
		};

		this.draw = function(ctx){
			if(this.scene < this.animation.scenes.length ){
				this.animation.draw(ctx, this.frame, this.scene);
			}
		};

	};

	exports.GameAnimation = GameAnimation;
})(this);
