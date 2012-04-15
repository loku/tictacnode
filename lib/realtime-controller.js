var Controller = require('./controller');
Channel = require('./channel');

// contract
// this.Model is set on instances
// Model is a realtime enabled model supporting instanceChange notifications

// a RealtimeController create a channel between any
// model changes and clients by establishing distributed
// communication channel on a per Model basis

var RealtimeController = module.exports = Controller.extend({

  initialize:function() {
    // wire the asynchronous updates
    this.updateChannel = new Channel({channelId: 'instanceChange'});
    // wire the change notification callback
    // assuming that updates pass through the
    // same player object
    var self = this;
    
    this.Model.on('instanceChange', function(updatedModel){
      console.log('on instance change');
      self.updateChannel.broadcast(updatedModel);
    });
  },

  // any objects read through the real-time controller
  // have real-time channels associated with the objects
  read:function(req, res) {
    // model should come in with enough info to
    // perform a fetch
    var model = new this.Model(req.model);
    // model has to be populated with at least an id
    var self = this;
    model.fetch({
                  success: function(fetchedModel){
                    // anytime client successfuly reads a
                    // realtime model
                    // the client socket as a listner
                    // to the update channel
                    self.updateChannel.addListener(req.socket);
                    res.success(fetchedModel);
                  },
                  error: function(err){
                    res.error(err);
                  }});
  },

  // updates that come through the controller
  // propogate change through open client channels
  update:function(req, res){
    var updatedModel = new this.Model(req.model);
    updatedModel.save(null,
                {
                success: function(updatedModel){
                  res.success(updatedModel)
                },
                error:function(err){
                  res.error(err);
                }
                });
  },

  // any objects create through a real-time controller
  // have a real-time channel associted with the object
  create: function(req, res) {
    // register the player
    var newModel = new this.Model(req.model);
    var self = this;
    newModel.save(null, {
                         success:function(newModel) {
                            res.success(newModel);
                            // anytime an realtime model is created
                            // the client socket is added to the set
                            // updateChannel listeners
                            self.updateChannel.addListener(req.socket);
                         },
                         error:function(err){
                           console.error('create error for model', err);
                           res.error(err);
                         }
                        });
  }

});

