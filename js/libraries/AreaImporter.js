;(function(exports) {

	exports.importArea = function(_en, areaName, offset, callback){
		microAjax("./js/areas/" + areaName + "/data.json", function(results) {
			results = JSON.parse(results);

			var bg, doors, collisionBoxes;
			//get & draw background
			if (results.background) {
				bg = document.createElement("canvas");
				canvg(bg, "./js/areas/" + areaName + "/" + results.background);
			}
			//create doors
			if (results.doors) {
				doors = results.doors;
				for(i = 0; i < doors.length; i++){
					_en.create(GameDoor, {
						"sensor":{
							"pos": {"x": doors[i][0][0] + offset.x, "y": doors[i][0][1] + offset.y},
							"size": {"x": doors[i][0][2] + offset.x, "y": doors[i][0][3] + offset.y}
						},
						"door": {
							"pos": {"x": doors[i][0][4] + offset.x, "y": doors[i][0][5] + offset.y},
							"size": {"x": doors[i][0][6] + offset.x, "y": doors[i][0][7] + offset.y}
						},
						"orientation": doors[i][1],
						"locked": doors[i][2]
					});
				}
			}
			//create collision boxes
			if (results.collisionBoxes) {
				collisionBoxes = results.collisionBoxes;
				for(i = 0; i < collisionBoxes.length; i++){
					_en.create(GameCollisionBox, {
						"pos": {"x": collisionBoxes[i][0] + offset.x, "y": collisionBoxes[i][1] + offset.y},
						"size": {"x": collisionBoxes[i][2] + offset.x, "y": collisionBoxes[i][3] + offset.y}
					});
				}
			}

			if (callback) {
				callback.apply(this, [{
					bg: bg,
					doors: doors,
					collisionBoxes: collisionBoxes
				}]);
			}
		});
	};

})(this);
