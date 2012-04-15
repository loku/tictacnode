var _ = require('underscore');

// channels bind notifications across a number objects


// all registered listing sockets by channelId
var listenersByChannelId = {};


function addListener(channelId, clientSocket){
  var listeners = listenersByChannelId[channelId];

  if (listeners == undefined){
    // start a new socket list
    listenersByChannelId[channelId] = [clientSocket];
  } else {
    // add to the unique list of client sockets
    if (_.indexOf(listeners, clientSocket) == -1){
      console.log('adding new socket to listen on channel', channelId);
      (listenersByChannelId[channelId]).push(clientSocket);
    }
  }
}

var Channel = module.exports = function() {
  // this allows sub-class to hook into
  // initialize
  this.initialize.apply(this, arguments);
};

Channel.prototype.initialize = function(opts){
  this.channelId = opts.channelId;
  addListener(opts.channelId, opts.socket);
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

Channel.extend = require('backbone').Model.extend;