var Promise = require('node-promise').Promise,
    all = require('node-promise').all,
    Controller = require('../realtime-controller'),
    Game = require('../models/game'),
    Player = require('../models/player');



function playerPromise(player){
  var promise = new Promise();
  player.fetch({success:function(fetchedPlayer){
                 // deliver fetched player           
                  promise.resolve(fetchedPlayer);
                },
                error: function(err){
                  promise.reject(err);
                }});
  return promise;
}


var GamesController = Controller.extend({
  Model:Game,

  initialize: function() {
    // super
    Controller.prototype.initialize.apply(this, arguments);
    this.pendingPlayer = null;
  },

  create: function(req, res) {
    // defend against page refresh
    if (this.pendingPlayer && (this.pendingPlayer.socket != req.socket)){
      var xPlayer = playerPromise(new Player({id:this.pendingPlayer.playerId}));
      var oPlayer = playerPromise(new Player({id:req.model.meId}));
      var self = this;
      all(xPlayer, oPlayer).then(function (results){
       
        var newGame = new Game({xPlayerId:results[0].get('id'), 
                                oPlayerId:results[1].get('id'),
                                // x goes first
                                activePlayerId:results[0].get('id')});
        newGame.save(null, {success: function(newGame){
                        //console.log('newGame', newGame);
                        res.success(newGame);
                        self.pendingPlayer.res.success(newGame);
                        // anytime an realtime model is created
                        // the client socket is added to the set
                        // updateChannel listeners
                        self.updateChannel.addListener(newGame.get('id'),
                                                       self.pendingPlayer.socket);
                        self.updateChannel.addListener(newGame.get('id'),
                                                       req.socket);
                        
                      },
                      error: function(err){
                        res.error(err);
                      }})
      });
    } else {
      console.log('setting player in pending state');
      this.pendingPlayer = {playerId:req.model.meId, socket:req.socket, res:res};
    }
  }
});

module.exports = GamesController;

