// grab jQuery from global, assumption will be
// that jQuery will be an html include
var $ = window.jQuery;
// need to tell backbone to use jQuery
require('backbone').setDomLibrary($);
// side-effecting requires
require('./socket-sync');

var Player = require('./common/player'),
// require the client override of the game model
    Game   = require('./models/game'),
    views  = require('./views/game.view');


$(function(){
  window.Player = Player;
  
  // register with game
  window.me = new Player({name: 'Johnny'});
  

  // me is now register
  window.me.save(null,
          {success: function() {
                      window.meId = me.get('id');
                      console.log('player syncd', me.get('id'));
                      window.game = new Game({meId: me.get('id')});
                      game.save(null, {success:function(){
                        // the game is joined
                        console.log('the game is joined', game);
                        game.on('gameUpdate', function(){
                          game.dumpGame();
                        })
                      }});

  },
  error:function(){
    console.log(arguments);
  }});





});
