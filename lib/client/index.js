// grab jQuery from global, assumption will be
// that jQuery will be an html include
var $ = window.jQuery;
// need to tell backbone to use jQuery
require('backbone').setDomLibrary($);
// side-effecting requires
require('./socket-sync');

var models = require('./common/game.model'),
    views = require('./game.view');


$(function(){

  // register with game
  var me = new models.Player({name: 'Johnny'});
  me.save(null, {success:function(){
  console.log('player syncd', me.id);

  me.on('change', function(){
    console.log('me changing to', me.get('name'));
  })

  var johnny2 = new models.Player({id:me.id});

  johnny2.fetch({
  success:function(model){
    console.log('successfully fetched', model);
  },
  error:function(model, err) {
    console.log('error fetching', err);
  }});

  johnny2.on('change', function(){
    console.log('johnny2 changing', johnny2.get('name'));
  })

  // update johnny later, and check propogation
  window.setTimeout(function(){
    johnny2.set('name', 'Ritchie');
    johnny2.save();
  }, 30000);


  

      // instance the game with two players
      //  var gameView = new views.GameView({
      //    model: new models.Game({
      //      playerId: me.Id,
      //    })
      //  });

  },
  error:function(){
    console.log(arguments);
  }});





});
