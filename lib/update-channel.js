var _ = require('underscore');

// channels bind updates for models to their client sockets

// all registered listing sockets by modelId
var listenersByModelId = {};

var UpdateChannel = module.exports = function() {
  // this allows sub-class to hook into
  // initialize
  this.initialize.apply(this, arguments);
};

UpdateChannel.prototype.initialize = function(opts){
  this.channelId = opts.channelId;
};

UpdateChannel.prototype.broadcast = function(updatedModel, clientFilter){
  // broadcast message for all the sockets listening
  // on this channel id
  var listeners = listenersByModelId[updatedModel.id];
  console.log('broadcasting update', updatedModel.id, ' to: ', listeners ? listeners.length: 0);
  var self = this;
  _.each(listeners, function(socket){
    // broadcast to all those not in the client filter
    if (!clientFilter[socket.id]){
      socket.emit(self.channelId, updatedModel);
      console.log('broadcasting to', socket.id);
    }
    console.log('clientFilter', clientFilter);
  });
}

UpdateChannel.prototype.addListener = function(modelId, clientSocket){
  // channelId's are are bound to clientSockets  
  var listeners = listenersByModelId[modelId];
  if (listeners == undefined){
    // start a new socket list
    listenersByModelId[modelId] = [clientSocket];
  } else {
    // add to the unique list of client sockets
    if (_.indexOf(listeners, clientSocket) == -1){
      (listenersByModelId[modelId]).push(clientSocket);
    }
 }
}

UpdateChannel.extend = require('backbone').Model.extend;