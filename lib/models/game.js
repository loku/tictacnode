var _ = require('underscore'),
    CommonGame = require('../common/game');

// add the memstore plug-in for Player
var Store = require('../backbone-memstore');

// define the server game
module.exports = CommonGame.extend({

  // server game objects keep track of live gamess
  initialize:function(){
    // super
    CommonGame.prototype.initialize.apply(this, arguments);
    this.localStorage = new Store();
  }

});
