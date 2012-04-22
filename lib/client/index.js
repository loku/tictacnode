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

  var bNameEntered = false;

  $('#myModal').modal()

  $('#loginForm').submit(function(){
    return false;
  })


  // detect the name changing
  $('#gameName').bind("change keyup input",function() {
      bNameEntered = true;
      $('#enterGame').removeClass('disabled');
  });



   $('#enterGame').click(function(e){
     if (!bNameEntered) {
        e.preventDefault();
        return false;
     }

     $('#myModal').modal('toggle');
     var name = $('#gameName').val();
     // register with game
     window.me = new Player({name: name});
     // me enters the game
     window.me.save(null,
                    {success: function() {
                               window.meId = me.get('id');
                                console.log('player syncd', me.get('id'));
                                window.game = new Game({meId: me.get('id')});
                                game.save(null,
                                          {success:function(){
                                            
                                              // the game is joined
                                              console.log('the game is joined', game);
                                              $('#statusBlock').css('display', 'none');
                                              window.gameView = new views.GameView({model:game});
                                            }
                                          });
                               
                             },
     
                    error:function(){
                      console.log(arguments);
                    }})
  })
});

