var _ = require('underscore'),
    Backbone = require('backbone'),
    Player = require('./player');
    Game = require('./game');



// Game consists of player*(s), a gameId and a lastMove
var Game = module.exports = Backbone.Model.extend({
  // superfluous defaults set meant only to make the
  // model schema more explicit
  defaults:{
    xPlayerId:null,
    oPlayerId:null,
    nextMove:null,
    winnerId:null
  },

  controller:'Games'
});
