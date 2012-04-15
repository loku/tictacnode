var _ = require('underscore'),
    Controller = require('../realtime-controller'),
    Player = require('../models/player')

var PlayersController = Controller.extend({
  // bind the Model class to the controller
  Model:Player
});

module.exports = PlayersController;

