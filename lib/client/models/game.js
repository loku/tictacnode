var models = require('../common/player');
var _ = require('underscore');


// extend for client'ness
var Game = module.exports = require('../common/game').extend({
  // overide parse function
  parse:function(res){
    var parsed = models.Game.prototype.parse.apply(this, arguments);

    // inflate client references to players
    var player1 = new Player({id:res.player1Id});
    player1.fetch();
    var player2 = new Player({id:res.player2Id});
    player1.fetch();
    
    return _.extend(parsed, {player1:player1, player2:player2});
  }
});