;(function(exports){
	var GameSpaceShip = function(_, settings){
		this.noCollision = true;

		this.maxStars = 150;
		this.starSpeed = 0.1;

		this.zindex = -100;

		var _en = _.coq.entities;

		importArea(_en, 'spaceship_1', {x: 0, y: 0}, function(area){this.area = area;}.bind(this));

		// _en.create(GameOptionBox, {
		// 	"pos": {"x": 380, "y": 305},
		// 	"size": {"x": 40, "y": 40},
		// 	"HUD": [
		// 		{
		// 			"key": 1,
		// 			"keyword": "ONE",
		// 			"text": "Disembark",
		// 			"action": function(){
		// 				_.changeGameState("planet live");
		// 			}.bind(this),
		// 			"enabled": true
		// 		}
		// 	],
		// 	"message": [
		// 		"If you're on a planet, station, or debris field, this is where you can disembark <span class='orion'>The Orion</span> and search for adventure [1]."
		// 	]
		// });

		_en.create(GameAnimation, {
			"animation": AnimationStarScroll,
			"zindex": -200
		});

		this.update = function(){
			//pass
		};

		this.draw = function(ctx){
			if (!this.area) return;
			ctx.drawImage(this.area.bg, 0, 0);
		};
	};

	exports.GameSpaceShip = GameSpaceShip;
})(this);
