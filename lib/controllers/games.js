var Controller = require('../controller');


var curGames = {};

var GamesController = Controller.extend({
  initialize: function() {
    this.pendingPlayer = null;
  },

  create: function(req, res) {
    var newGame = new
    // req.model
    // create a new game with

    // client game has one player set

    // create only returns

    req.success(newGame);
  }
});

module.exports = GamesController;

