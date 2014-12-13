;(function(exports) {
  var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
    var canvas = document.getElementById(canvasId);
    this.renderer = new Coquette.Renderer(this, game, canvas, width,height, backgroundColor);
    this.inputter = new Coquette.Inputter(this, canvas, autoFocus);
    this.entities = new Coquette.Entities(this, game);
    this.runner = new Coquette.Runner(this);
    this.collider = new Coquette.Collider(this);

    var self = this;
    this.ticker = new Coquette.Ticker(this, function(interval) {
      self.collider.update(interval);
      self.runner.update(interval);
      if (game.update !== undefined) {
        game.update(interval);
      }
      self.inputter.lockChanges();
      self.entities.update(interval);
      self.renderer.update(interval);
      self.inputter.clearChanges();
    });
  };

  exports.Coquette = Coquette;
})(this);

;(function(exports) {
  var Collider = function(coquette) {
    this.coquette = coquette;
  };

  Collider.prototype = {
    collideRecords: [],

    update: function() {
      var ent = this.coquette.entities.all(undefined, true);
      for (var i = 0, len = ent.length; i < len; i++) {
        for (var j = i; j < len; j++) {
          if (ent[i] !== ent[j]) {
            if (this.isIntersecting(ent[i], ent[j])) {
              this.collision(ent[i], ent[j]);
            } else {
              this.removeOldCollision(ent[i], ent[j]);
            }
          }
        }
      }
    },

    collision: function(entity1, entity2) {
      if (this.getCollideRecord(entity1, entity2) === undefined) {
        this.collideRecords.push([entity1, entity2]);
        notifyEntityOfCollision(entity1, entity2, this.INITIAL);
        notifyEntityOfCollision(entity2, entity1, this.INITIAL);
      } else {
        notifyEntityOfCollision(entity1, entity2, this.SUSTAINED);
        notifyEntityOfCollision(entity2, entity1, this.SUSTAINED);
      }
    },

    removeEntity: function(entity) {
      this.removeOldCollision(entity);
    },

    // if passed entities recorded as colliding in history record, remove that record
    removeOldCollision: function(entity1, entity2) {
      var recordId = this.getCollideRecord(entity1, entity2);
      if (recordId !== undefined) {
        var record = this.collideRecords[recordId];
        notifyEntityOfUncollision(record[0], record[1]);
        notifyEntityOfUncollision(record[1], record[0]);
        this.collideRecords.splice(recordId, 1);
      }
    },

    getCollideRecord: function(entity1, entity2) {
      for (var i = 0, len = this.collideRecords.length; i < len; i++) {
        // looking for coll where one entity appears
        if (entity2 === undefined &&
            (this.collideRecords[i][0] === entity1 ||
             this.collideRecords[i][1] === entity1)) {
          return i;
        // looking for coll between two specific entities
        } else if (this.collideRecords[i][0] === entity1 &&
                   this.collideRecords[i][1] === entity2) {
          return i;
        }
      }
    },

    isIntersecting: function(obj1, obj2) {
      var obj1BoundingBox = obj1.boundingBox || this.RECTANGLE;
      var obj2BoundingBox = obj2.boundingBox || this.RECTANGLE;
      if (obj1BoundingBox === this.RECTANGLE &&
          obj2BoundingBox === this.RECTANGLE) {
        return Maths.rectanglesIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.CIRCLE &&
                 obj2BoundingBox === this.CIRCLE) {
        return Maths.circlesIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.CIRCLE) {
        return Maths.circleAndRectangleIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.RECTANGLE) {
        return Maths.circleAndRectangleIntersecting(obj2, obj1);
      } else {
        throw "Objects being collision tested have unsupported bounding box types.";
      }
    },

    INITIAL: 0,
    SUSTAINED: 1,

    RECTANGLE: 0,
    CIRCLE: 1
  };

  var notifyEntityOfCollision = function(entity, other, type) {
    if (entity.collision !== undefined) {
      entity.collision(other, type);
    }
  };

  var notifyEntityOfUncollision = function(entity, other) {
    if (entity.uncollision !== undefined) {
      entity.uncollision(other);
    }
  };

  var Maths = {
    center: function(obj) {
      if(obj.pos !== undefined) {
        return {
          x: obj.pos.x + (obj.size.x / 2),
          y: obj.pos.y + (obj.size.y / 2),
        };
      }
    },

    circlesIntersecting: function(obj1, obj2) {
      return Maths.distance(Maths.center(obj1), Maths.center(obj2)) <
        obj1.size.x / 2 + obj2.size.x / 2;
    },

    pointInsideObj: function(point, obj) {
      return point.x >= obj.pos.x
        && point.y >= obj.pos.y
        && point.x <= obj.pos.x + obj.size.x
        && point.y <= obj.pos.y + obj.size.y;
    },

    rectanglesIntersecting: function(obj1, obj2) {
      if(obj1.pos.x + obj1.size.x < obj2.pos.x) {
        return false;
      } else if(obj1.pos.x > obj2.pos.x + obj2.size.x) {
        return false;
      } else if(obj1.pos.y > obj2.pos.y + obj2.size.y) {
        return false;
      } else if(obj1.pos.y + obj1.size.y < obj2.pos.y) {
        return false;
      } else {
        return true;
      }
    },

    distance: function(point1, point2) {
      var x = point1.x - point2.x;
      var y = point1.y - point2.y;
      return Math.sqrt((x * x) + (y * y));
    },

    rectangleCorners: function(rectangleObj) {
      var corners = [];
      corners.push({ x:rectangleObj.pos.x, y: rectangleObj.pos.y });
      corners.push({ x:rectangleObj.pos.x + rectangleObj.size.x, y:rectangleObj.pos.y });
      corners.push({
        x:rectangleObj.pos.x + rectangleObj.size.x,
        y:rectangleObj.pos.y + rectangleObj.size.y
      });
      corners.push({ x:rectangleObj.pos.x, y: rectangleObj.pos.y + rectangleObj.size.y });
      return corners;
    },

    vectorTo: function(start, end) {
      return {
        x: end.x - start.x,
        y: end.y - start.y
      };
    },

    magnitude: function(vector) {
      return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    unitVector: function(vector) {
      return {
        x: vector.x / Maths.magnitude(vector),
        y: vector.y / Maths.magnitude(vector)
      };
    },

    closestPointOnSeg: function(linePointA, linePointB, circ_pos) {
      var seg_v = Maths.vectorTo(linePointA, linePointB);
      var pt_v = Maths.vectorTo(linePointA, circ_pos);
      if (Maths.magnitude(seg_v) <= 0) {
        throw "Invalid segment length";
      }

      var seg_v_unit = Maths.unitVector(seg_v);
      var proj = Maths.dotProduct(pt_v, seg_v_unit);
      if (proj <= 0) {
        return linePointA;
      } else if (proj >= Maths.magnitude(seg_v)) {
        return linePointB;
      } else {
        return {
          x: linePointA.x + seg_v_unit.x * proj,
          y: linePointA.y + seg_v_unit.y * proj
        };
      }
    },

    isLineIntersectingCircle: function(circleObj, linePointA, linePointB) {
      var circ_pos = {
        x: circleObj.pos.x + circleObj.size.x / 2,
        y: circleObj.pos.y + circleObj.size.y / 2
      };

      var closest = Maths.closestPointOnSeg(linePointA, linePointB, circ_pos);
      var dist_v = Maths.vectorTo(closest, circ_pos);
      return Maths.magnitude(dist_v) < circleObj.size.x / 2;
    },

    circleAndRectangleIntersecting: function(circleObj, rectangleObj) {
      var corners = Maths.rectangleCorners(rectangleObj);
      return Maths.pointInsideObj(Maths.center(circleObj), rectangleObj) ||
        Maths.isLineIntersectingCircle(circleObj, corners[0], corners[1]) ||
        Maths.isLineIntersectingCircle(circleObj, corners[1], corners[2]) ||
        Maths.isLineIntersectingCircle(circleObj, corners[2], corners[3]) ||
        Maths.isLineIntersectingCircle(circleObj, corners[3], corners[0]);
    }
  };

  exports.Collider = Collider;
  exports.Collider.Maths = Maths;
})(typeof exports === 'undefined' ? this.Coquette : exports);

 ;(function(exports) {
  var Inputter = function(coquette, canvas, autoFocus) {
    this.coquette = coquette;
    if (autoFocus === undefined) {
      autoFocus = true;
    }

    var self = this;
    var inputReceiverElement = window;
    if (!autoFocus) {
      inputReceiverElement = canvas;
      inputReceiverElement.contentEditable = true; // lets canvas get focus and get key events
      this.suppressedKeys = [];
    } else {
      this.supressedKeys = [
        this.SPACE,
        this.LEFT_ARROW,
        this.UP_ARROW,
        this.RIGHT_ARROW,
        this.DOWN_ARROW
      ];

      // suppress scrolling
      window.addEventListener("keydown", function(e) {
        if(self.supressedKeys.indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
      }, false);
    }

    inputReceiverElement.addEventListener('keydown', this.keydown.bind(this), false);
    inputReceiverElement.addEventListener('keyup', this.keyup.bind(this), false);
  };

  Inputter.prototype = {
    _locked: false,
    _lockedChanges: {},
    _changes: {},
    _state: {},
    bindings: {},

    state: function(keyCode, state) {
      if (state !== undefined) {
        this._state[keyCode] = state;
      } else {
        return this._state[keyCode] || false;
      }
    },

    lockChanges: function(){
      this._locked = true;
    },

    changes: function(keyCode, state){
      if(state !== undefined){
        if(this._locked){
          this._lockedChanges[keyCode] = state;
        } else{
          this._changes[keyCode] = state;
        }
      } else{
        return this._changes[keyCode] || false;
      }
    },

    clearChanges: function(){
      this._changes = this._lockedChanges;
      this._lockedChanges = {};
      this.locked = false;
    },

    keydown: function(e) {
      this.state(e.keyCode, true);
      this.changes(e.keyCode, true);
    },

    keyup: function(e) {
      this.state(e.keyCode, false);
      this.changes(e.keyCode, false);
    },

    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMI_COLON: 186,
    EQUALS: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    GRAVE_ACCENT: 192,
    OPEN_SQUARE_BRACKET: 219,
    BACK_SLASH: 220,
    CLOSE_SQUARE_BRACKET: 221,
    SINGLE_QUOTE: 222

  };
  exports.Inputter = Inputter;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  function Runner(coquette) {
    this.coquette = coquette;
    this.runs = [];
  }

  Runner.prototype = {
    update: function() {
      this.run();
    },

    run: function() {
      while(this.runs.length > 0) {
        var run = this.runs.pop();
        run.fn(run.obj);
      }
    },

    add: function(obj, fn) {
      this.runs.push({
        obj: obj,
        fn: fn
      });
    }
  };

  exports.Runner = Runner;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var interval = 16;
  var paused = false;

  function Ticker(coquette, gameLoop) {
    setupRequestAnimationFrame();
    var prev = new Date().getTime();

    this.stop = false;

    var self = this;
    this.tick = function() {
      var now = new Date().getTime();
      var interval = now - prev;
      prev = now;
      if(!self.stop){
        gameLoop(interval);
        requestAnimationFrame(self.tick);
      } else{
        gameLoop(interval);
      }
    };

    requestAnimationFrame(this.tick);
  }

  // From: https://gist.github.com/paulirish/1579671
  // Thanks Erik, Paul and Tino
  var setupRequestAnimationFrame = function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
        || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, interval - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                   timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  };

  exports.Ticker = Ticker;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var Renderer = function(coquette, game, canvas, wView, hView, backgroundColor) {
    this.coquette = coquette;
    this.game = game;
    canvas.style.outline = "none"; // stop browser outlining canvas when it has focus
    canvas.style.cursor = "default"; // keep pointer normal when hovering over canvas
    this.ctx = canvas.getContext('2d');
    this.backgroundColor = backgroundColor;
    canvas.width = wView;
    canvas.height = hView;
    this.viewSize = { x:wView, y:hView };
    this.worldSize = { x:wView, y:hView };
    this.viewCenter = { x:wView / 2, y:hView / 2 };
  };

  Renderer.prototype = {
    getCtx: function() {
      return this.ctx;
    },

    moveViewCenter: function(dpos){
      this.viewCenter.x += dpos.x;
      this.viewCenter.y += dpos.y;
    },

    setViewCenter: function(pos) {
      this.viewCenter = { x:pos.x, y:pos.y };
    },

    setWorldSize: function(size) {
      this.worldSize = { x:size.x, y:size.y };
    },

    getViewPort: function(){
      return {
        "x": this.viewCenter.x - this.viewSize.x / 2,
        "y": this.viewCenter.y - this.viewSize.y / 2,
        "width": this.viewSize.x,
        "height": this.viewSize.y
      };
    },

    update: function(interval) {
      var ctx = this.getCtx();

      // draw background
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(-this.viewSize.x / 2,
                   -this.viewSize.y / 2,
                   this.worldSize.x + this.viewSize.x / 2,
                   this.worldSize.y + this.viewSize.y / 2);
      var viewTranslate = viewOffset(this.viewCenter, this.viewSize);
      // translate so all objs placed relative to viewport
      ctx.translate(-viewTranslate.x, -viewTranslate.y);

      // draw game and entities which are not static
      var collidables = this.coquette.entities.all(undefined, true);
      var noncollidables = this.coquette.entities.all(undefined, false);
      noncollidables.push(this.game);
      var c_i = 0;
      var nc_i = 0;
      while(c_i < collidables.length || nc_i < noncollidables.length){
        if(c_i < collidables.length && nc_i < noncollidables.length && (collidables[c_i].zindex || 0) < (noncollidables[nc_i].zindex || 0)){
          if (collidables[c_i].draw !== undefined && (collidables[c_i].isStatic === undefined)) {
            collidables[c_i].draw(ctx);
          } else if(collidables[c_i].draw !== undefined){
            ctx.translate(viewTranslate.x, viewTranslate.y);
            collidables[c_i].draw(ctx);
            ctx.translate(-viewTranslate.x, -viewTranslate.y);
          }
          c_i ++;
        } else if (nc_i < noncollidables.length){
          if (noncollidables[nc_i].draw !== undefined && (noncollidables[nc_i].isStatic === undefined)) {
            noncollidables[nc_i].draw(ctx);
          } else if(noncollidables[nc_i].draw !== undefined){
            ctx.translate(viewTranslate.x, viewTranslate.y);
            noncollidables[nc_i].draw(ctx);
            ctx.translate(-viewTranslate.x, -viewTranslate.y);
          }
          nc_i++;
        } else{
          if (collidables[c_i].draw !== undefined && (collidables[c_i].isStatic === undefined)){
            collidables[c_i].draw(ctx);
          } else if(collidables[c_i].draw !== undefined){
            ctx.translate(viewTranslate.x, viewTranslate.y);
            collidables[c_i].draw(ctx);
            ctx.translate(-viewTranslate.x, -viewTranslate.y);
          }
          c_i ++;
        }
      }

      //translate back
      ctx.translate(viewTranslate.x, viewTranslate.y);
    },

    center: function() {
      return {
        x: this.worldSize.x / 2,
        y: this.worldSize.y / 2
      };
    },

    onScreen: function(obj) {
      return obj.pos.x >= this.viewCenter.x - this.viewSize.x / 2 &&
        obj.pos.x <= this.viewCenter.x + this.viewSize.x / 2 &&
        obj.pos.y >= this.viewCenter.y - this.viewSize.y / 2 &&
        obj.pos.y <= this.viewCenter.y + this.viewSize.y / 2;
    }
  };

  var viewOffset = function(viewCenter, viewSize) {
    return {
      x:Math.floor(viewCenter.x - viewSize.x / 2),
      y:Math.floor(viewCenter.y - viewSize.y / 2)
     }
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  function Entities(coquette, game) {
    this.coquette = coquette;
    this.game = game;
    this._noncolliders = [];
    this._colliders = [];
  }

  Entities.prototype = {
    update: function(interval) {
      var entities = this.all();
      for (var i = 0, len = entities.length; i < len; i++) {
        if (entities[i].update !== undefined) {
          entities[i].update(interval);
        }
      }
    },

    all: function(Constructor, collision) {
      if(Constructor === undefined){
        if(collision === undefined){
          return this._colliders.concat(this._noncolliders);
        } else if(collision){
          return this._colliders.slice(0);
        } else{
          return this._noncolliders.slice(0);
        }
      } else{
        var c = collision === undefined ? 0 : collision ? 0 : this._colliders.length;
        var nc = collision === undefined ? 0 : collision ? this._noncolliders.length : 0;
        var entities = [];
        for(c; c < this._colliders.length; c++){
          if(this._colliders[c] instanceof Constructor){
            entities.push(this._colliders[c]);
          }
        }
        for(nc; nc < this._noncolliders.length; nc++){
          if(this._noncolliders[nc] instanceof Constructor){
            entities.push(this._noncolliders[nc]);
          }
        }
        return entities;
      }
    },

    create: function(clazz, settings, callback) {
      var self = this;
      this.coquette.runner.add(this, function(entities) {
        var entity = new clazz(self.game, settings || {});
        if(typeof(entity.noCollision) === "undefined" || entity.noCollision === false){
          entities._colliders.push(entity);
          zindexSort(entities._colliders);
        } else{
          entities._noncolliders.push(entity);
          zindexSort(entities._noncolliders);
        }
        if (callback !== undefined) {
          callback(entity);
        }
      });
    },

    clear: function(callback) {
      var self = this;
      var entities = this.all();
      for(var e in entities){
        self.destroy(entities[e]);
      }
      if (callback !== undefined) {
        callback(entity);
      }
    },


    destroy: function(entity, callback) {
      var self = this;
      this.coquette.runner.add(this, function(entities) {
        for(var i = 0; i < entities._colliders.length; i++) {
          if(entities._colliders[i] === entity) {
            entities._colliders.splice(i, 1);
            if (callback !== undefined) {
              callback();
            }
            break;
          }
        }
        for(var i = 0; i < entities._noncolliders.length; i++) {
          if(entities._noncolliders[i] === entity) {
            entities._noncolliders.splice(i, 1);
            if (callback !== undefined) {
              callback();
            }
            break;
          }
        }
      });
    }
  };

  // sorts passed array by zindex
  // elements with a higher zindex are drawn on top of those with a lower zindex
  var zindexSort = function(arr) {
    arr.sort(function(a, b) {
      var aSort = (a.zindex || 0);
      var bSort = (b.zindex || 0);
      return aSort < bSort ? -1 : 1;
    });
  };

  exports.Entities = Entities;
})(typeof exports === 'undefined' ? this.Coquette : exports);

