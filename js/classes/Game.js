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
				"game won" : stateGameWon,
				"game lost" : stateGameLost
			})[this.gameState](this, changeVars);
		};

		this.update = function(){
			if(this.coq.inputter.changes(this.coq.inputter.P)){
				this.coq.ticker.stop = true;
			}
			if(this.coq.inputter.changes(this.coq.inputter.O)){
				this.GALAXY.debugMode = ! this.GALAXY.debugMode;
			}
			if(this.coq.inputter.changes(this.coq.inputter.C)){
				this.coq.renderer.setViewCenter(this.coq.renderer.center());
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

		this.alertOsacians = function(team) {
			var players = this.coq.entities.all(GamePlayer);
			var player = players[0];
			var osacians = this.coq.entities.all(Osacian);
			osacians = osacians.filter(function(o) {
				return o.team == team;
			});
			for (var o_i = 0; o_i < osacians.length; o_i++) {
				osacians[o_i].noticePlayer(player);
			}
		}

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

	var Star = function(x, y, size, speed){
		this.x = x || 0;
		this.y = y || 0;
		this.size = size || 1;
		this.speed = speed || 0;
	};

	var stateStartScreen = function(game, changeVars){
		game.setMessage("Make your way to the escape pods!");
		game.appendMessage("Use the number keys (1-8) to choose options.");
		game.appendMessage("Arrow keys or WASD to move");
		game.appendMessage("Click to shoot");
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
					"text": "Start Game",
					"enabled": true
				},
			]
		});
		game.coq.entities.create(GameAnimation, {
			animation: AnimationWarp
		});
	};

	var stateGameLost = function(game, changeVars){
		game.setMessage("You have died.");
		game.appendMessage("(If the frame rate drops on your next playthrough, try just refreshing the page!)");
		game.coq.entities.create(GameScreen, {
			init: function(gameScreen){
				game.coq.renderer.setWorldSize({x: 800, y: 600});
				game.coq.renderer.setViewCenter(game.coq.renderer.center());
			},
			HUD:[
				{
					"key": 1,
					"keyword": "ONE",
					"action": function(){
						game.changeGameState("start screen");
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

	var stateGameWon = function(game, changeVars){
		game.setMessage("You have made it off the Osacian Ship.");
		game.appendMessage("Reference this code in your comment: 1" + Math.random().toString().substring(5,8));
		game.coq.entities.create(GameScreen, {
			init: function(gameScreen){
				game.coq.renderer.setWorldSize({x: 800, y: 600});
				game.coq.renderer.setViewCenter(game.coq.renderer.center());
			},
			HUD:[
				{
					"key": 1,
					"keyword": "ONE",
					"action": function(){
						game.changeGameState("start screen");
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
				game.coq.renderer.setWorldSize({x: 2400, y: 1600});
				game.coq.renderer.setViewCenter({x: 400, y: 300});
				game.coq.entities.create(GameSpaceShip, {}, function(s){gameScreen.screen = s;});
			},
			HUD: [
				{
					"key": 8,
					"keyword": "EIGHT",
					"action": function(){
						this.changeGameState('start screen');
					}.bind(game),
					"text": "Quit",
					"enabled": true
				}
			],
			player: {
				pos: function(){
					return {x: 125, y: 330};
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

	exports.Star = Star;

	exports.Game = Game;
})(this);
