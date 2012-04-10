/**
 *
 * Client requires
 */

var $ = window.jQuery;
// need to tell backbone to use jQuery
require('backbone').setDomLibrary($);

var models = require('./game.model'),
    views = require('./game.view');

$(function(){
  var gameView = new views.GameView({
    model:new models.Game({
      player1:new models.Player({name:'Johnny'}),
      player2:new models.Player({name:'Janie'})
    })
  });
});



