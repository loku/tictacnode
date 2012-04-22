var Controller = require('./controller');
UpdateChannel = require('./update-channel');


var pendingUpdatesByClient = {};

// contract
// this.Model is set on instances
// Model is a realtime enabled model supporting instanceChange notifications

// a RealtimeController create a channel between any
// model changes and clients by establishing distributed
// communication channel on a per Model basis

var RealtimeController = module.exports = Controller.extend({

  initialize:function() {
    console.log('initializing realtime controller');
    // wire the asynchronous updates
    this.updateChannel = new UpdateChannel({channelId: 'instanceChange'});
    // add the update channel to the Model class, binding
    // in the newly instanced channel
    var self = this;
    this.Model = this.Model.extend({
      // the natural is to add intialize and self on('instanceChange'...
      // check for gargbage collection issues
      triggerInstanceChange:function(opts){
        console.log('triggering change noticication');
        // filter any pending updates, to avoid getting
        // signaled back on your own change
        // server updates go unfiltered
        console.log('server chage', opts.serverUpdate);
        self.updateChannel.broadcast(this, opts.serverUpdate ? {} : pendingUpdatesByClient);
      }
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
                    res.success(fetchedModel);
                    self.updateChannel.addListener(fetchedModel.id, req.socket);
                  },
                  error: function(err){
                    res.error(err);
                  }});
  },

  // updates that come through the controller
  // propogate change through open client channels
  update:function(req, res){
    var updatedModel = new this.Model(req.model);
    console.log('adding to client filter', req.socket.id);
    pendingUpdatesByClient[req.socket.id] = true;
    updatedModel.save(null,
                {
                success: function(updatedModel){
                  console.log('removing to client filter', req.socket.id);
                  delete pendingUpdatesByClient[req.socket.id];
                  res.success(updatedModel)
                },
                error:function(err){
                  console.log('removing to client filter', req.socket.id);
                  delete pendingUpdatesByClient[req.socket.id];
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
                            self.updateChannel.addListener(newModel.id,
                                                           req.socket);
                         },
                         error:function(err){
                           console.error('create error for model', err);
                           res.error(err);
                         }
                        });
  }

});

