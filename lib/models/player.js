var _ = require('underscore'),
    CommonPlayer = require('../common/player');

// add the memstore plug-in for Player
var Store = require('../backbone-memstore');

// extend for server'ness
var Player = module.exports = CommonPlayer.extend({
  initialize:function() {
    CommonPlayer.prototype.initialize.apply(this, arguments);
    this.localStorage = new Store();
  }
});
