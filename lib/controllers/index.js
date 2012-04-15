var _ = require('underscore');

var controllers = {
  Games: new (require('./games')),
  Players: new (require('./players'))
};

// middleware: Any object references returned
//             to he websocket client to insure
//             that changes are broadcast to all
//             listeners


// map of object id to sockets
var subscribers = {};

function addSubscription(objectId, clientSocket){
  if (subscribers[objectId] == undefined){
    subscribers[objectId] = [clientSocket];
  } else {
    // add to the unique list of client sockets
    if (_.indexOf(subscribers, clientSocket) == -1){
      (subscribers[objectId]).push(clientSocket);
    }
  }
}


module.exports = function(socket) {
  // TODO timeout?
  socket.on('syncRequest', function(req) {
    var res = {
      success: function(res) {
        socket.emit('syncResponse-' + req.requestId, {success: res});  
      },
      error: function(err) {
        socket.emit('syncResponse-' + req.requestId, {error: err});
      }
    };
    req.socket = socket;


    
    controllers[req.controller].handle(req, res);
  });
};
