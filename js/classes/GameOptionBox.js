;(function(exports){
	var GameOptionBox = function(_, settings){
		for (var i in settings) {
			this[i] = settings[i];
		}

		this.visible = false;
		this.enabled = false;
		this.HUDOptions = [];

		this.collision = function(other){
			if(other instanceof GamePlayer){
				if(this.message !== undefined && this.enabled === false){
					this.enabled = true;
					_.setMessage(this.message[0]);
					for(var j = 1; j < this.message.length; j++){
						_.appendMessage(this.message[j]);
					}
				} else if(this.enabled === false){
					this.enabled = true;
				}
			}
		};
		this.uncollision = function(other){
			if(other instanceof GamePlayer){
				_.setMessage("");
				this.enabled = false;
			}
		};
		this.update = function(){
			if(this.enabled && !this.visible){
				this.visible = true;
				var addToHUD = function(e){this.HUDOptions.push(e);}.bind(this);
				for(var h_option in this.HUD){
					_.coq.entities.create(GameHUDOption, this.HUD[h_option], addToHUD);
				}
			} else if(!this.enabled && this.visible){
				this.visible = false;
				for (var h = 0; h < this.HUDOptions.length; h++){
					_.coq.entities.destroy(this.HUDOptions[h]);
				}
				this.HUDOptions = [];
			}
		};
		this.draw = function(ctx){
			if(_.GALAXY.debugMode){
				ctx.strokeStyle = this.enabled ? "#0000ff" : "gray";
				ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
				ctx.beginPath();
				ctx.moveTo(this.pos.x, this.pos.y);
				ctx.lineTo(this.pos.x + this.size.x, this.pos.y + this.size.y);
				ctx.moveTo(this.pos.x + this.size.x, this.pos.y);
				ctx.lineTo(this.pos.x, this.pos.y + this.size.y);
				ctx.stroke();
			} else {
				ctx.fillStyle = this.enabled ? _.settings.color_option_enabled : _.settings.color_option_disabled;
				ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
			}
		};
	};

	exports.GameOptionBox = GameOptionBox;
})(this);
