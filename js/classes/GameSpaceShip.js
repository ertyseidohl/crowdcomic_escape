;(function(exports){
	var GameSpaceShip = function(_, settings){
		this.noCollision = true;

		this.maxStars = 150;
		this.starSpeed = 0.1;

		this.zindex = -100;

		var _en = _.coq.entities;

		importArea(_en, 'spaceship_1', {x: 0, y: 0}, function(area){this.area = area;}.bind(this));

		_en.create(GameOptionBox, {
			"pos": {"x": 305, "y": 455},
			"size": {"x": 190, "y": 40},
			"HUD": [
				{
					"key": 1,
					"keyword": "ONE",
					"text": "Repairs",
					"action": function(){
						console.log("yeah!");
					}.bind(this),
					"enabled": true
				}
			],
			"message":[
				"The engine room of <span class='orion'>The Orion</span> is dark and noisy.",
				"Here, you can repair your ship, if necessary [1]."
			]
		});

		_en.create(GameOptionBox, {
			"pos": {"x": 530, "y": 330},
			"size": {"x": 90, "y": 90},
			"HUD": [
				{
					"key": 1,
					"keyword": "ONE",
					"text": "Medical",
					"action": function(){
						console.log("yeah!");
					}.bind(this),
					"enabled": true
				}
			],
			"message":[
				"You enter the medical bay of the ship.",
				"Various medical robots and instruments whirr and blink around you.",
				"You can heal yourself very quickly here [1]."
			]
		});

		_en.create(GameOptionBox, {
			"pos": {"x": 180, "y": 330},
			"size": {"x": 90, "y": 90},
			"HUD": [
				{
					"key": 1,
					"keyword": "ONE",
					"text": "Weapons",
					"action": function(){
						console.log("yeah!");
					}.bind(this),
					"enabled": true
				},
				{
					"key": 2,
					"keyword": "TWO",
					"text": "Reload",
					"action": function(){
						console.log("yeah!");
					}.bind(this),
					"enabled": true
				}
			],
			"message": [
				"You enter your armory. Various racks and shelves hide away your weaponry.",
				"Here, you can exchange your weapons [1] and refresh your ammunition [2]."
			]
		});

		_en.create(GameOptionBox, {
			"pos": {"x": 380, "y": 305},
			"size": {"x": 40, "y": 40},
			"HUD": [
				{
					"key": 1,
					"keyword": "ONE",
					"text": "Disembark",
					"action": function(){
						_.changeGameState("planet live");
					}.bind(this),
					"enabled": true
				}
			],
			"message": [
				"If you're on a planet, station, or debris field, this is where you can disembark <span class='orion'>The Orion</span> and search for adventure [1]."
			]
		});

		_en.create(GameOptionBox, {
			"pos": {"x": 330, "y": 80},
			"size": {"x": 140, "y": 65},
			"HUD": [
				//{
				//	"key": 1,
				//	"keyword": "ONE",
				//	"text": "Adventure",
				//	"action": function(){
				//		_.changeGameState('adventure animation');
				//		_.setMessage("The hyperdrives spin up, and you find yourself speeding through the stars!");
				//	}.bind(this),
				//	"enabled": true
				//},
				{
					"key": 1,
					"keyword": "ONE",
					"text": "StarMap",
					"action": function(){
						_.changeGameState('galaxy map');
					}.bind(this),
					"enabled": true
				}
			],
			"message": [
				"You enter the bridge of <span class='orion'>The Orion</span>.",
				"From here, you can spend fuel in an attempt to find uncharted planets [1].",
				"Or you can view the galaxy map, to visit a planet you've already discovered [2]."
			]
		});

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
