var _ = require('underscore'),
    Game = require('../common/game');

// add the memstore plug-in for Player
var Store = require('../backbone-memstore');
    
var Game = module.exports = Game.extend({
  initialize:function(){
    this.localStorage = new Store();
  }
});
