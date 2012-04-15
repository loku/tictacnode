var _ = require('underscore');

// channels bind notifications across a number objects


// all registered listing sockets by channelId
var listenersByChannelId = {};

var Channel = module.exports = function() {
  // this allows sub-class to hook into
  // initialize
  this.initialize.apply(this, arguments);
};

Channel.prototype.initialize = function(opts){
  this.channelId = opts.channelId;
};

Channel.prototype.broadcast = function(message){
  // broadcast message for all the sockets listening
  // on this channel id
  var listeners = listenersByChannelId[this.channelId];
  var self = this;
  _.each(listeners, function(socket){
    socket.emit(self.channelId, message);
  });
}

Channel.prototype.addListener = function(clientSocket){
  var listeners = listenersByChannelId[this.channelId];

  if (listeners == undefined){
    // start a new socket list
    listenersByChannelId[this.channelId] = [clientSocket];
  } else {
    // add to the unique list of client sockets
    if (_.indexOf(listeners, clientSocket) == -1){
      console.log('adding new socket to listen on channel', this.channelId);
      (listenersByChannelId[this.channelId]).push(clientSocket);
    }
 }
}

Channel.extend = require('backbone').Model.extend;