;(function(exports){
	var GameScreenHUD = function(_, settings){
		this.noCollision = true;
		this.isStatic = true;
		this.zIndex = 1000;
		var _en = _.coq.entities;
		var _in = _.coq.inputter;

		for (var i in settings){
			_en.create(GameHUDOption, settings[i]);
		}
	};
	exports.GameScreenHUD = GameScreenHUD;
})(this);
