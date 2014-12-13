;(function(exports){
	var GameScreen = function(_, settings){
		this.noCollision = true;

		var _en = _.coq.entities;
		var _ren = _.coq.renderer;

		var player = null;
		var screen = null;

		settings.init(this);

		if(settings.player !== undefined){
			_en.create(GamePlayer, settings.player, function(p){
				this.player = p;
				if(settings.playerLight) {
					_en.create(
						Light,
						{
							pos: {
								x: p.pos.x + p.size.x / 2,
								y: p.pos.y + p.size.y / 2
							},
							color: "rgba(200,200,255,0.8)"
						},
						function(l){this.playerLight = l;}.bind(this)
					);
				}
			}.bind(this));
		}

		this.draw = function(ctx){
			if(_.GALAXY.debugMode){
				ctx.fillStyle = "#ff6600";
				ctx.fillRect(_ren.viewCenter.x - 1, _ren.viewCenter.y - 1, 2, 2);
			}
		};

		this.update = function(){
			if(this.player === undefined) return;

			var viewPort = _ren.getViewPort();

			if((_ren.viewCenter.x < this.player.pos.x && viewPort.x + viewPort.width < _ren.worldSize.x) ||
				(_ren.viewCenter.x > this.player.pos.x && viewPort.x > 0)){
				_ren.moveViewCenter({x: (this.player.pos.x - _ren.viewCenter.x) / 20, y: 0});
			}

			if((_ren.viewCenter.y < this.player.pos.y && viewPort.y + viewPort.height < _ren.worldSize.y) ||
				(_ren.viewCenter.y > this.player.pos.y && viewPort.y > 0)){
				_ren.moveViewCenter({x: 0, y: (this.player.pos.y - _ren.viewCenter.y) / 20});
			}

			if (this.playerLight) {
				this.playerLight.pos = {
					x: this.player.pos.x + this.player.size.x / 2,
					y: this.player.pos.y + this.player.size.y  / 2
				};
			}
		};

		this.getLightSegments = function() {
			var renderBox = {
				pos: {
					x: _ren.viewCenter.x - _ren.viewSize.x / 2,
					y: _ren.viewCenter.y - _ren.viewSize.y / 2
				},
				size: {
					x: _ren.viewSize.x,
					y: _ren.viewSize.y
				}
			};
			return [
				{
					x1: renderBox.pos.x,
					y1: renderBox.pos.y,
					x2: renderBox.pos.x + renderBox.size.x,
					y2: renderBox.pos.y
				},
				{
					x1: renderBox.pos.x + renderBox.size.x,
					y1: renderBox.pos.y,
					x2: renderBox.pos.x + renderBox.size.x,
					y2: renderBox.pos.y + renderBox.size.y
				},
				{
					x1: renderBox.pos.x + renderBox.size.x,
					y1: renderBox.pos.y + renderBox.size.y,
					x2: renderBox.pos.x,
					y2: renderBox.pos.y + renderBox.size.y
				},
				{
					x1: renderBox.pos.x,
					y1: renderBox.pos.y + renderBox.size.y,
					x2: renderBox.pos.x,
					y2: renderBox.pos.y
				}
			];
		};

		_en.create(GameScreenHUD, settings.HUD);
	};

	exports.GameScreen = GameScreen;
})(this);
