;(function(exports){
	var Game = function(canvasId, textId, width, height, gameSettings) {
		this.settings = gameSettings;
		this.coq = new Coquette(this, canvasId, width, height, this.settings.color_background_fill);
		this.gameState = null;
		this.GALAXY = {};

		this.GALAXY.positions = {};
		this.GALAXY.randomSeed = Math.random();
		this.GALAXY.debugMode = false;

		this.setMessage = function(msg, col){
			var color = col || this.settings.color_text_default;
			this.GALAXY.text = [{"msg": msg, "col": col}];
			document.getElementById(textId).innerHTML = "<p style='color: " + color + "'>" + msg + "</p>";
		};

		this.appendMessage = function(msg, col){
			var color = col || this.settings.color_text_default;
			this.GALAXY.text.push({"msg": msg, "col": col});
			document.getElementById(textId).innerHTML += "<p style='color: " + color + "'>" + msg + "</p>";
		};

		this.changeGameState = function(newState, changeVars){
			var player = this.coq.entities.all(GamePlayer);
			if(changeVars === undefined) changeVars = {};
			if(player[0] !== undefined){
				this.GALAXY.positions[this.gameState] = player[0].pos;
			}

			this.gameState = newState;

			if(this.GALAXY.positions[this.gameState] !== undefined){
				changeVars.storedPlayerPosition = this.GALAXY.positions[this.gameState];
			}

			this.setMessage("");
			this.coq.entities.clear();

			this.coq.renderer.setViewCenter({x:400,y:300});
			({	"start screen": stateStartScreen,
				"space ship": stateSpaceShip,
			})[this.gameState](this, changeVars);
		};

		this.update = function(){
			if(this.coq.inputter.changes(this.coq.inputter.P)){
				this.changeGameState("");
				this.coq.ticker.stop = true;
			}
			if(this.coq.inputter.changes(this.coq.inputter.D)){
				this.GALAXY.debugMode = ! this.GALAXY.debugMode;
			}
			if(this.coq.inputter.changes(this.coq.inputter.C)){
				this.coq.renderer.setViewCenter(this.coq.renderer.center());
			}
			if(this.coq.inputter.changes(this.coq.inputter.S)){
				saveGame(this);
			}
		};

		this.getAllBoxSegments = function() {
			var segments = [];
			this.coq.entities.all().forEach(function(ent) {
				if (ent.getLightSegments !== undefined) {
					segments = segments.concat(ent.getLightSegments());
				}
			});
			return segments;
		};

	};

	var shuffle = function(array) {
		//http://stackoverflow.com/a/962890/374601
		var tmp, current, top = array.length;

		if(top) while(--top) {
			current = Math.floor(Math.random() * (top + 1));
			tmp = array[current];
			array[current] = array[top];
			array[top] = tmp;
		}

		return array;
	};

	var generateGalaxy = function(_){
		Math.seedrandom(_.GALAXY.randomSeed);
		var a = 50; //length
		var b = 0.6; //tightness
		var points = 70; //resolution
		var density = 4; //stars per point
		var discRadius = 30; //radius of center disc
		var discDensity = 3000; //stars in disc
		var armPull = 0.6; //percent of stars which stay in the arm disc radius
		var center = {x: 3000, y:3000}; //center of GameGalaxyMap
		var scale = 2; //scaling factor of entire image
		var armCount = 5; //number of galaxy arms
		var armDiscRad = 1.4; //arm disc brush radius
		var armStartPoint = 5; //how many points to skip at the center

		var createGalaxyArm = function(center, rot){
			var stars = [];
			for(var i = armStartPoint; i < points; i++){
				var theta = i * (Math.PI * 2) / points;
				var x = a*Math.pow(Math.E, b * theta)*Math.cos(theta - rot) + center.x;
				var y = a*Math.pow(Math.E, b * theta)*Math.sin(theta - rot) + center.y;
				stars = stars.concat(createGalaxyDisc({x: x, y: y}, i * armDiscRad, density * i));
			}
			return stars;
		};

		var createGalaxyDisc = function(center, rad, density){
			var stars = [];
			for(var j = 0; j < density; j++){
				var t = 2 * Math.PI * Math.random();
				var u = (Math.random() + Math.random()) * rad;
				var r = u > rad && Math.random() < armPull ? rad - u : u;
				stars.push(new Star(center.x + scale * r * Math.cos(t), center.y + scale * r * Math.sin(t), Math.random() * 3 + 1));
			}
			return stars;
		};

		if(_.GALAXY.galaxyStars === undefined){
			var temp = [];
			for(var i = 0; i < armCount; i++){
				temp = temp.concat(createGalaxyArm(center, (i * 2 * Math.PI / armCount)));
			}
			temp = temp.concat(createGalaxyDisc(center, discRadius, discDensity));
			temp.sort(function(a, b){
				return a.y - b.y;
			});
			_.GALAXY.galaxyStars = temp;
		}
	};

	var Star = function(x, y, size, speed){
		this.x = x || 0;
		this.y = y || 0;
		this.size = size || 1;
		this.speed = speed || 0;
	};

	var stateStartScreen = function(game, changeVars){
		game.setMessage("Welcome to Space Adventure");
		game.appendMessage("Use the number keys (1-8) to choose options.");
		game.appendMessage("You can start a new game [1], or continue a saved game [2], if you have one.");
		game.appendMessage("This is an alpha release! You can <a href='./changelog.txt'>check out the changelog</a> while I'm working on this.", "#ff0000");
		game.coq.entities.create(GameScreen, {
			init: function(gameScreen){
				game.coq.renderer.setWorldSize({x: 800, y: 600});
				game.coq.renderer.setViewCenter(game.coq.renderer.center());
				game.coq.entities.create(GameStartScreen, {}, function(s){gameScreen.screen = s;});
			},
			HUD:[
				{
					"key": 1,
					"keyword": "ONE",
					"action": function(){
						game.changeGameState("space ship");
					}.bind(this),
					"text": "New Game",
					"enabled": true
				},
			]
		});
		game.coq.entities.create(GameAnimation, {
			animation: AnimationWarp
		});
	};

	var stateSpaceShip = function(game, changeVars){
		game.coq.entities.create(GameScreen, {
			init: function(gameScreen){
				game.coq.renderer.setWorldSize({x: 800, y: 600});
				game.coq.renderer.setViewCenter({x: 400, y: 300});
				game.coq.entities.create(GameSpaceShip, {}, function(s){gameScreen.screen = s;});
				game.setMessage("Welcome to Space, adventurer!");
				game.appendMessage("You find yourself adrift in the Corellis arm of the galaxy, one million credits in debt.");
				game.appendMessage("Find your way around the Galaxy and earn your freedom!");
				game.appendMessage("Fortunately, you have your trusty spaceship, <span class='orion'>The Orion</span>.");
				game.appendMessage("Use the arrow keys to move, and the number keys to select options.");
				game.appendMessage("May fortune smile upon you, adventurer!");
			},
			HUD: [
				{
					"key": 8,
					"keyword": "EIGHT",
					"action": function(){
						saveGame(this);
						this.changeGameState('start screen');
						this.appendMessage("Game Saved", game.color_text_info);
					}.bind(game),
					"text": "Save/Quit",
					"enabled": true
				}
			],
			player: {
				pos: function(){
					return changeVars.storedPlayerPosition === undefined ? {x: 390, y: 210} : changeVars.storedPlayerPosition;
				}(),
				size: {
					x: 25,
					y: 25
				},
			},
			playerLight: true
		});
	};

	var renderToCanvas = function (width, height, renderFunction) {
		var buffer = document.createElement('canvas');
		buffer.width = width;
		buffer.height = height;
		renderFunction(buffer.getContext('2d'));
		return buffer;
	};

	var generateOneString = function(len){
		var ones = "11111111111111111111111111";
		return ones.substring(0, len);
	};

	exports.Star = Star;

	exports.Game = Game;
})(this);
