;(function(exports){
	var GameHUDOption = function(_, settings){
		this.noCollision = true;
		this.isStatic = true;
		for (var i in settings) {
			this[i] = settings[i];
		}
		this.zindex = 110;
		this.update = function(){
			if(this.enabled){
				if(_.coq.inputter.changes(_.coq.inputter[this.keyword])){
					this.action.apply(this, []);
				}
			}
			if(settings.update !== undefined) settings.update.apply(this, [_]);
		};
		this.draw = function(ctx){
			ctx.fillStyle = _.settings.color_hud_fill;
			ctx.strokeStyle = this.enabled ? _.settings.color_hud_text : _.settings.color_hud_text_disabled;
			ctx.fillRect(100 * (this.key - 1), 550, 100, 50);
			ctx.strokeRect(100 * (this.key - 1), 550, 100, 50);
			ctx.fillStyle = this.enabled ? _.settings.color_hud_text : _.settings.color_hud_text_disabled;
			ctx.font = _.settings.font_hud;
			ctx.fillText(this.key, (100 * (this.key - 1)) + 5, 570);
			ctx.fillText(this.text, (100 * (this.key -1)) + 5, 590);
		};
	};

	exports.GameHUDOption = GameHUDOption;
})(this);
