;(function(exports){
	var GameStartScreen = function(_, settings){
		this.noCollision = true;

		var _en = _.coq.entities;

		_en.create(GameText, {
			"text": "Space Adventure",
			"fillStyle": _.settings.color_text,
			"font": _.settings.font_title,
			"y": 100
		});
	};

	exports.GameStartScreen = GameStartScreen;
})(this);
