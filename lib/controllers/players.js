var _ = require('underscore'),
    Controller = require('../controller'),
    Player = require('../models/player')
    Channel = require('../channel');

var PlayersController = Controller.extend({
  initialize: function() {},

  read:function(req, res){
    // read should come in with enough info to
    // perform a fetch: for Players it is an id
    var player = new Player(req.model);
    // model has to be populated with at least an id
    player.fetch({
                  success: function(fetchedPlayer){
                    res.success(fetchedPlayer);
                  },
                  error: function(err){
                    res.error(err);
                  }});
  },

  update:function(req, res){
    var player = new Player(req.model);
    player.save(null,
                {
                success: function(updatedPlayer){
                  res.success(updatedPlayer)
                },
                error:function(err){

                }
                });
  },

  create: function(req, res) {
    // register the player
    var newPlayer = new Player(req.model);
    newPlayer.save(null, {
                          success:function(newPlayer) {
                            // wire the asynchronous updates
                            var updateChannel =
                              new Channel({socket: req.socket,
                                          channelId: 'changeMessage-' + newPlayer.id});

                            // wire the change notification callback
                            // assuming that updates pass through the
                            // same player object
                            newPlayer.on('change', function(){
                              updateChannel.broadcast(newPlayer);
                            });

                            res.success(newPlayer);

                            setTimeout(function(){
                              console.log('updating name');
                              newPlayer.set('name', 'updated Johny');
                            }, 20000);
                         },
                         error:function(err){
                           console.error('create error for Player', err);
                           res.error(err);
                         }
                        });
  }
});

module.exports = PlayersController;

